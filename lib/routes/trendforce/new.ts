import { type CheerioAPI, load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

function parseGmtDate(value: number | string | undefined) {
    if (value === undefined || value === '') {
        return;
    }
    return parseDate(typeof value === 'string' && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? `${value}Z` : value);
}
export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 10);
    const apiSlug = 'wp-json/wp/v2';
    const baseUrl = 'https://www.trendforce.com';
    const targetUrl: string = new URL('news/', baseUrl).href;
    const apiUrl = new URL(`${apiSlug}/posts`, targetUrl).href;
    const response = await ofetch(apiUrl, {
        query: {
            _embed: 'true',
            per_page: limit,
        },
    });
    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    const items: DataItem[] = response.slice(0, limit).map((item): DataItem => {
        const title: string = item.title?.rendered ?? item.title;
        const $$: CheerioAPI = load(item.content.rendered);
        $$('div.article_highlight-area-BG_wrap').remove();
        const description: string | undefined = $$.html();
        const pubDate: number | string = item.date_gmt;
        const linkUrl: string | undefined = item.link;
        const terminologies = item._embedded?.['wp:term'];
        const categories: string[] = terminologies?.flat().map((c) => c.name) ?? [];
        const authors: DataItem['author'] =
            item._embedded?.author?.map((author) => ({
                name: author.name,
                url: author.url,
                avatar: undefined,
            })) ?? [];
        const guid: string = item.guid?.rendered ?? item.guid;
        const image: string | undefined = item._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? undefined;
        const updated: number | string | undefined = item.modified_gmt;
        const processedItem: DataItem = {
            title,
            description,
            pubDate: parseGmtDate(pubDate),
            link: linkUrl ?? guid,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: $$.text(),
            },
            image,
            banner: image,
            updated: parseGmtDate(updated),
            language,
        };
        return processedItem;
    });
    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};
export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'www.trendforce.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/trendforce/news',
    parameters: undefined,
    description: undefined,
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
            source: ['www.trendforce.com/news/'],
            target: '/news',
        },
    ],
    view: ViewType.Articles,
};
