import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
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

        return getFinalContentAndUrl(new URL(nextUrl, url).href, newRedirects, maxRedirects);
    }
    return [responseContent, url];
}

type ArticleDetails = Pick<DataItem, 'title' | 'description' | 'author' | 'pubDate' | 'updated' | 'content'> & { link: string };

async function fetchArticleDetails(link: string): Promise<ArticleDetails> {
    const [detailResponse, finalUrl] = await getFinalContentAndUrl(link);
    const $ = load(detailResponse);
    const description = $('div#articleBox').html();
    const pubDateStr = $('span.yearMsg').text() && $('span.timeMsg').text() ? `${$('span.yearMsg').text()} ${$('span.timeMsg').text()}` : undefined;
    const pubDate = getPublicationDate(pubDateStr);
    return {
        title: $('div.articleTitle h1').text(),
        link: finalUrl,
        description,
        pubDate,
        updated: pubDate,
        author: $('spna.sourceMsg').text(),
        content: { html: description, text: $('div#articleBox').text() },
    };
}

export const handler = async (ctx: Context): Promise<Data> => {
    const params = ctx.req.param();
    let category: string;
    let id: string;

    if (params.category !== undefined && params.id !== undefined) {
        category = params.category;
        id = params.id;
    } else if (params.category !== undefined || params.id !== undefined) {
        category = '';
        id = params.id ?? params.category;
    } else {
        category = defaultCategory;
        id = defaultId;
    }

    category = category.replaceAll(/[^a-z0-9-]/gi, '');

    const limit = getRouteLimit(ctx, 30);

    const baseUrl = `https://${category ? `${category}.` : ''}ynet.com`;
    const targetUrl: string = new URL(`list/${id}.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh') as Language;

    let items: DataItem[] = $('li.cfix')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h2 a');

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('em.fRight').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: getPublicationDate(pubDateStr),
                link: linkUrl,
                updated: getPublicationDate(upDatedStr),
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }
            const details = await cache.tryGet<ArticleDetails>(`ynet:article:v3:${item.link}`, () => fetchArticleDetails(item.link!));
            return {
                ...item,
                ...details,
                pubDate: details.pubDate ?? item.pubDate,
                updated: details.updated ?? item.updated,
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: getImageUrl($('div.cul_logo img').attr('src'), targetUrl),
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
    description: `::: tip
订阅 [北青快讯](https://news.ynet.com/list/2121t76.html)，其源网址为 \`https://news.ynet.com/list/2121t76.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/ynet/list/news/2121t76\`](https://rsshub.app/ynet/list/news/2121t76)。
:::`,
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
            target: '/list',
        },
        {
            source: ['news.ynet.com/list/2121t76.html'],
            target: '/list/news/2121t76',
        },
    ],
    view: ViewType.Articles,
};

function getPublicationDate(value: unknown): Date | undefined {
    if (typeof value !== 'string' || !value.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}

function getImageUrl(value: string | undefined, baseUrl: string): string | undefined {
    if (!value) {
        return;
    }
    try {
        const url = new URL(value, baseUrl);
        if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) {
            return url.href;
        }
    } catch {
        // Ignore unsupported source image URLs.
    }
    return;
}
