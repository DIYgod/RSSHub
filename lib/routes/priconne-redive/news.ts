import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/news/:server?',
    categories: ['game'],
    example: '/priconne-redive/news',
    parameters: { server: '服务器，默认日服' },
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
            source: ['priconne-redive.jp/news'],
            target: '/news/jp',
        },
        {
            source: ['princessconnect.so-net.tw/news'],
            target: '/news/zh-tw',
        },
        {
            source: ['game.bilibili.com/pcr/news.html'],
            target: '/news/zh-cn',
        },
    ],
    name: '最新公告',
    maintainers: ['SayaSS', 'frankcwl'],
    handler,
    url: 'priconne-redive.jp/news',
    description: `服务器

| 国服  | 台服  | 日服 |
| ----- | ----- | ---- |
| zh-cn | zh-tw | jp   |`,
};

async function handler(ctx): Promise<Data> {
    const { server = 'jp' } = ctx.req.param();

    switch (server) {
        case 'jp': {
            const link = 'https://priconne-redive.jp/news/';
            const loadedSource1 = (await got(link)).data;
            const $ = load(loadedSource1);
            const client = await cache.tryGet('priconne-redive:jp:public-client', () => getPublicJpClient($, link));
            const headers = { 'X-MICROCMS-API-KEY': client.apiKey };
            const query = new URLSearchParams({
                fields: 'id,title,categories,display_date,thumbnail,display_flag',
                limit: '20',
                offset: '0',
                filters: 'display_flag[contains]公式にもDMM版にも表示する[or]display_flag[contains]公式サイトのみ表示する',
            });
            const list: { contents: JpArticle[] } = (await got(`${client.baseUrl}?${query}`, { headers })).data;
            const items = await pMap(
                list.contents,
                async (item) => ({
                    link: `${link}${item.id}/`,
                    ...(await cache.tryGet(`priconne-redive:jp:article:${item.id}`, async () => {
                        const query = new URLSearchParams({ fields: 'title,display_date,body_html,categories,display_flag,thumbnail' });
                        const detail: Omit<JpArticle, 'id'> = (await got(`${client.baseUrl}/${item.id}?${query}`, { headers })).data;
                        return {
                            title: detail.title,
                            description: detail.body_html,
                            pubDate: detail.display_date ? parseDate(detail.display_date) : undefined,
                            category: detail.categories,
                        };
                    })),
                }),
                { concurrency: 3 }
            );
            return { title: '公主链接日服-新闻', link, language: 'ja', item: items };
        }
        case 'zh-tw': {
            const link = 'https://www.princessconnect.so-net.tw/news';
            const loadedSource2 = (await got(link)).data;
            const $ = load(loadedSource2);
            const links = [
                ...new Set(
                    $('a[href^="/news/newsDetail/"]')
                        .toArray()
                        .map((item) => new URL($(item).attr('href')!, link).href)
                ),
            ];
            const items = await pMap(
                links,
                async (link) => ({
                    link,
                    ...(await cache.tryGet(`priconne-redive:tw:article:${link}`, async () => {
                        const loadedSource3 = (await got(link)).data;
                        const $ = load(loadedSource3);
                        const article = $('main article .news_con');
                        const date = article.find('time').attr('datetime');
                        const category = article
                            .find('.news_meta span')
                            .toArray()
                            .map((item) => $(item).text());
                        const content = article.find('.news-body');
                        content.find('.visually-hidden').remove();
                        return {
                            title: article.find('h2').text(),
                            description: content.html(),
                            pubDate: date ? parseDateInTimezone(date.replaceAll('.', '-'), 8) : undefined,
                            category,
                        };
                    })),
                }),
                { concurrency: 3 }
            );
            return { title: '公主连结台服-最新公告', link, language: 'zh-TW', item: items };
        }
        case 'zh-cn': {
            const response = await got({
                method: 'get',
                url: 'https://api.biligame.com/news/list?gameExtensionId=267&positionId=2&typeId=&pageNum=1&pageSize=5',
            });
            const list: { data: CnArticle[] } = response.data;
            const items = await pMap(
                list.data,
                async (item) => ({
                    title: item.title,
                    link: `https://game.bilibili.com/pcr/news.html#detail=${item.id}`,
                    pubDate: item.ctime ? parseDateInTimezone(item.ctime, 8) : undefined,
                    ...(await cache.tryGet(`priconne-redive:cn:article:${item.id}`, async () => {
                        const response = await got(`https://api.biligame.com/news/${item.id}`);
                        return { description: response.data.data.content };
                    })),
                }),
                { concurrency: 3 }
            );

            return {
                title: '公主连结国服-最新公告',
                link: 'https://game.bilibili.com/pcr/news.html',
                item: items,
            };
        }
        default:
            throw new InvalidParameterError('Unsupported server. Use jp, zh-tw, or zh-cn.');
    }
}

interface JpArticle {
    id: string;
    title: string;
    categories: string[];
    display_date?: string;
    body_html?: string;
}

async function getPublicJpClient($: CheerioAPI, pageUrl: string): Promise<{ baseUrl: string; apiKey: string }> {
    const urls = $('link[rel="modulepreload"][href]')
        .toArray()
        .map((link) => new URL($(link).attr('href')!, pageUrl).href)
        .filter((url) => new URL(url).origin === new URL(pageUrl).origin && url.endsWith('.js'));
    const scripts = await pMap(urls, async (url) => ({ url, body: String((await got(url)).data) }), { concurrency: 3 });
    for (const script of scripts) {
        const client = script.body.match(/new\s+[\w$]+\(\{serviceDomain:([\w$]+),apiKey:([\w$]+)\}\)/);
        if (!client) {
            continue;
        }
        const bindings = script.body
            .matchAll(/import\s*\{([^}]+)\}\s*from["']([^"']+)["']/g)
            .toArray()
            .flatMap((match) =>
                match[1].split(',').map((binding) => {
                    const [exported, local = exported] = binding.split(/\s+as\s+/).map((name) => name.trim());
                    return { exported, local, url: new URL(match[2], script.url).href };
                })
            );
        const values = client.slice(1).map((local) => {
            const binding = bindings.find((binding) => binding.local === local);
            const configScript = scripts.find((script) => script.url === binding?.url);
            const exports = configScript?.body.match(/export\s*\{([^}]+)\}/)?.[1].split(',');
            const exported = exports
                ?.find(
                    (entry) =>
                        entry
                            .split(/\s+as\s+/)
                            .at(-1)
                            ?.trim() === binding?.exported
                )
                ?.split(/\s+as\s+/, 1)[0]
                ?.trim();
            return exported ? configScript?.body.match(new RegExp(`\\b${exported}\\s*=\\s*([\`"'])(.*?)\\1`))?.[2] : undefined;
        });
        if (values[0] && values[1] && /^[\w-]+$/.test(values[0])) {
            return { baseUrl: `https://${values[0]}.microcms.io/api/v1/news`, apiKey: values[1] };
        }
    }
    throw new Error('The public Princess Connect news API configuration was not found in the current website scripts.');
}

interface CnArticle {
    id: number;
    title: string;
    ctime?: string;
}
