import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const defaultCategory = 'news';
const defaultId = '2121t76';

async function getFinalContentAndUrl(url: string, redirects: number = 0, maxRedirects: number = 5): Promise<[string, string]> {
    if (redirects > maxRedirects) {
        const finalResponse = await ofetch(url);
        return [finalResponse, url];
    }

    const responseContent = await ofetch(url);

    const jsRedirectMatch = responseContent.match(/(?:location\.href|window\.location\.replace)\s*=\s*['"](.*?)['"];/i);
    const nextUrl = jsRedirectMatch?.[1];

    if (nextUrl) {
        const newRedirects = redirects + 1;

        return getFinalContentAndUrl(nextUrl, newRedirects, maxRedirects);
    } else {
        return [responseContent, url];
    }
}

export const handler = async (ctx: Context): Promise<Data> => {
    const params = ctx.req.param();
    let category: string;
    let id: string;

    const paramKeys = Object.keys(params);

    if (paramKeys.length === 2) {
        category = params[paramKeys[0]];
        id = params[paramKeys[1]];
    } else if (paramKeys.length === 1) {
        category = '';
        id = params[paramKeys[0]];
    } else {
        category = defaultCategory;
        id = defaultId;
    }

    category = category.replaceAll(/[^a-zA-Z0-9-]/g, '');

    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = `https://${category ? `${category}.` : ''}ynet.com`;
    const targetUrl: string = new URL(`list/${id}.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('li.cfix')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h2 a');

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('em.fRight').text() || undefined;
            const linkUrl: string | undefined = $aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : undefined,
                link: linkUrl,
                updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const [detailResponse, finalUrl] = await getFinalContentAndUrl(item.link);

                const $$: CheerioAPI = load(detailResponse);

                item.link = finalUrl;

                const title: string = $$('div.articleTitle h1').text();
                const description: string | undefined = $$('div#articleBox').html() ?? undefined;
                const pubDateStr: string | undefined = $$('span.yearMsg').text() && $$('span.timeMsg').text() ? `${$$('span.yearMsg').text()} ${$$('span.timeMsg').text()}` : undefined;
                const authors: DataItem['author'] = $$('spna.sourceMsg').text();
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.cul_logo img').attr('src') ? `https:${$('div.cul_logo img').attr('src')}` : undefined,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/list/:category?/:id?',
    name: '列表',
    url: 'ynet.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/ynet/list/news/2121t76',
    parameters: {
        category: {
            description: '分类，默认为 `news`，可在对应分类页 URL 中找到',
        },
        id: {
            description: '列表 ID，可在对应列表页 URL 中找到',
        },
    },
    description: `:::tip
订阅 [北青快讯](https://news.ynet.com/list/2121t76.html)，其源网址为 \`https://news.ynet.com/list/2121t76.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/ynet/list/news/2121t76\`](https://rsshub.app/ynet/list/news/2121t76)。
:::
`,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ynet.com'],
            target: (_, url) => {
                const urlObj = new URL(url);

                const domainParts = urlObj.hostname.split('.');
                let category = '';

                if (domainParts.length > 2) {
                    const subdomains = domainParts.slice(0, -2).filter((part) => part !== 'www');
                    if (subdomains.length > 0) {
                        category = subdomains[0];
                    }
                }

                const idMatch = urlObj.pathname.match(/\/list\/(.+)\.html/);
                const id = idMatch ? idMatch[1] : '';

                return `/ynet/list${category ? `/${category}` : ''}${id ? `/${id}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
