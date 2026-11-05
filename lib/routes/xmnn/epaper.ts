import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/epaper/:id?',
    categories: ['traditional-media'],
    example: '/xmnn/epaper/xmrb',
    parameters: { id: '报纸 id，见下表，默认为 `xmrb`，即厦门日报' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['epaper.xmnn.cn/:id'],
            target: '/epaper/:id',
        },
        {
            source: ['epaper.xmrb.com/xmrb/*path', 'epaper.xmrb.com/xmrb/'],
            target: '/epaper/xmrb',
        },
    ],
    name: '数字媒体',
    maintainers: ['nczitzk'],
    handler,
    description: `| 厦门日报 | 厦门晚报 | 海西晨报 | 城市捷报 |
| -------- | -------- | -------- | -------- |
| xmrb     | xmwb     | hxcb     | csjb     |`,
};
type ArticleLink = Pick<DataItem, 'title'> & {
    link: string;
};
type ArticleDetails = Partial<Pick<DataItem, 'title' | 'description' | 'author' | 'pubDate' | 'category'>>;
const getPage = async (url: string) => {
    const response = await ofetch.raw(url, { responseType: 'text' });
    return { data: response._data ?? '', url: response.url || url };
};
const getRedirect = (data: string, $: CheerioAPI) => {
    // The current desktop entry declares a redirect separately from its mobile branch.
    const desktop = data.match(/(?:window\.)?location\.href\s*=\s*["']([^"']*\/pc\/col\/index\.html(?:[?#][^"']*)?)["']/);
    const legacy = data.match(/window\.location\.href\s*=\s*["']([^"']+)["']/) ?? data.match(/setTimeout\("javascript:location\.href='(.*?)'", 3000\);/);
    const refresh = $('meta[http-equiv]')
        .filter((_, element) => $(element).attr('http-equiv')?.toLowerCase() === 'refresh')
        .first()
        .attr('content')
        ?.match(/url=(.*)/i);
    return desktop?.[1] ?? legacy?.[1] ?? refresh?.[1];
};
const resolveHumanLink = (href: string | undefined, url: string) => {
    if (!href) {
        return;
    }
    try {
        const link = new URL(href, url);
        return isOneOf(link.protocol, ['https:', 'http:']) ? link.href : undefined;
    } catch {
        return;
    }
};
const getArticles = ($: CheerioAPI, url: string): ArticleLink[] => {
    const modern = $('#articlelist > li > a[href]');
    if (!modern.length) {
        $('#pdfsrc, .bigImg, .smallImg').remove();
        $('a img').each((_, element) => {
            $(element).parent().remove();
        });
    }
    const links = modern.length ? modern : $('.br1, .br2, .titss').find('a');
    return links.toArray().flatMap((element) => {
        const link = resolveHumanLink($(element).attr('href'), url);
        return link ? { title: $(element).text(), link } : [];
    });
};
const getPublicationDate = (value: string) => {
    if (!value) {
        return;
    }
    const normalized = value.trim().replace(/^(\d{4}年\d{1,2}月\d{1,2}日)\s+星期[一二三四五六日天]$/, '$1');
    const date = parseDate(normalized, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD', 'YYYY年MM月DD日', 'YYYY年M月D日'], true);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
};
const getArticleDetails = async (url: string): Promise<ArticleDetails> => {
    const page = await getPage(url);
    const $ = load(page.data);
    $('#qw').remove();
    const parts = [$('#PreTitle').text(), $('#Title').text(), $('#SubTitle').text()].filter(Boolean);
    const category = $('#layout .font-weight').text();
    const modernBody = $('#ozoom').first();
    return {
        title: parts.length ? parts.join(' ') : undefined,
        author: $('#Author').text() || undefined,
        description: (modernBody.length ? modernBody : $('.cont-b, content').first()).html() ?? undefined,
        pubDate: getPublicationDate($('#paperdate').text() || $('.time').text() || $('.today').text()),
        category: category ? [category] : undefined,
    };
};
async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'xmrb';
    const parsedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
    const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 80;
    const rootUrl = 'https://epaper.xmnn.cn';
    const rootPage = await getPage(`${rootUrl}/${id === 'hxcb' ? '/hxcb/epaper/paperindex.htm' : `${id}/`}`);
    let currentUrl = rootPage.url;
    let $ = load(rootPage.data);
    const title = id === 'hxcb' ? '海西晨报电子版_厦门网' : $('title').text();
    const redirect = getRedirect(rootPage.data, $);
    if (redirect) {
        const overview = await getPage(new URL(redirect, currentUrl).href);
        currentUrl = overview.url;
        $ = load(overview.data);
    }
    const layoutLinks = $('#list > li > a[href]')
        .toArray()
        .flatMap((element) => {
            const link = resolveHumanLink($(element).attr('href'), currentUrl);
            return link || [];
        });
    const editions = layoutLinks.length
        ? await pMap(
              layoutLinks,
              (url) =>
                  cache.tryGet(url, async () => {
                      const page = await getPage(url);
                      return getArticles(load(page.data), page.url);
                  }),
              { concurrency: 3 }
          )
        : [getArticles($, currentUrl)];
    const seen = new Set<string>();
    const links = editions
        .flat()
        .filter((item) => {
            if (seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, limit);
    const items = await pMap(
        links,
        async (item): Promise<DataItem> => {
            const details = await cache.tryGet(item.link, () => getArticleDetails(item.link));
            return { ...item, ...details, title: details.title ?? item.title };
        },
        { concurrency: 3 }
    );
    return { title, link: currentUrl, item: items };
}
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
