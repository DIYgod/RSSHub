import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

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
const getPage = async (url: string) => {
    const response = await ofetch.raw(url);
    return { data: response._data, url: response.url };
};
const getArticles = ($: CheerioAPI, url: string) =>
    $('#articlelist > li > a[href]')
        .toArray()
        .map((element) => ({ title: $(element).text(), link: new URL($(element).attr('href')!, url).href }));
const getArticleDetails = async (url: string) => {
    const page = await getPage(url);
    const $ = load(page.data);
    return {
        title: [$('#PreTitle').text(), $('#Title').text(), $('#SubTitle').text()].filter(Boolean).join(' '),
        author: $('#Author').text() || undefined,
        description: $('#ozoom').html(),
        pubDate: parseDate($('#paperdate').text(), 8),
        category: [$('#layout .font-weight').text()],
    };
};
async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'xmrb';
    const limit = getRouteLimit(ctx, 80);
    const rootUrl = 'https://epaper.xmnn.cn';
    const rootPage = await getPage(`${rootUrl}/${id === 'hxcb' ? '/hxcb/epaper/paperindex.htm' : `${id}/`}`);
    let $ = load(rootPage.data);
    const title = id === 'hxcb' ? '海西晨报电子版_厦门网' : $('title').text();
    const redirect = rootPage.data.match(/location\.href="([^"]*\/pc\/col\/index\.html)"/);
    if (!redirect) {
        throw new Error(`Cannot find the desktop edition link on ${rootPage.url}`);
    }
    const overview = await getPage(new URL(redirect[1], rootPage.url).href);
    const currentUrl = overview.url;
    $ = load(overview.data);
    const layoutLinks = $('#list > li > a[href]')
        .toArray()
        .map((element) => new URL($(element).attr('href')!, currentUrl).href);
    const editions = await pMap(
        layoutLinks,
        (url) =>
            cache.tryGet(url, async () => {
                const page = await getPage(url);
                return getArticles(load(page.data), page.url);
            }),
        { concurrency: 3 }
    );
    const links = editions.flat().slice(0, limit);
    const items = await pMap(
        links,
        async (item): Promise<DataItem> => {
            const details = await cache.tryGet(item.link, () => getArticleDetails(item.link));
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );
    return { title, link: currentUrl, item: items };
}
