import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl: string = 'https://www.ifanr.com';
    const apiBaseUrl: string = 'https://sso.ifanr.com';
    const targetUrl: string = new URL('digest', baseUrl).href;
    const apiUrl: string = new URL('api/v5/wp/buzz', apiBaseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            limit,
            offset: 0,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language: string = $('html').attr('lang') ?? 'zh-CN';

    const items: DataItem[] = response.objects.slice(0, limit).map((item): DataItem => {
        const title: string = item.post_title;
        const description: string = item.post_content;
        const pubDate: number | string = item.created_at;
        const linkUrl: string = `digest/${item.post_id}`;
        const guid: string = `ifanr-digest-${item.post_id}`;
        const updated: number | string = item.updated_at ?? pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: new URL(linkUrl, baseUrl).href,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.post_content ?? description,
            },
            updated: updated ? parseDate(updated) : undefined,
            language,
            _extra: {
                links: [
                    {
                        url: item.buzz_original_url,
                        type: 'via',
                        content_html: item.post_content,
                    },
                ],
            },
        };

        return processedItem;
    });

    const title: string = $('title').text();

    return {
        title,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.c-header-navbar__logo').attr('src'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/digest',
    name: '快讯',
    url: 'www.ifanr.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifanr/digest',
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
            source: ['www.ifanr.comdigest'],
            target: '/digest',
        },
    ],
    view: ViewType.Articles,
};
