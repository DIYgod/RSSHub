import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://download.lineageos.org';
    const targetUrl: string = new URL('changes', baseUrl).href;
    const apiUrl: string = new URL('api/v2/changes', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'en';

    const response = await ofetch(apiUrl);

    const items: DataItem[] = response.slice(0, limit).map((item): DataItem => {
        const title: string = item.subject;
        const pubDate: number | string = item.submitted;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = [item.type, item.branch, item.repository];
        const updated: number | string = item.updated;

        const processedItem: DataItem = {
            title,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: linkUrl,
            category: categories,
            updated: updated ? parseDate(updated, 'X') : undefined,
            language,
        };

        return processedItem;
    });

    return {
        title: `${$('title').text()} - Downloads`,
        description: undefined,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: $('title').text(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/changes',
    name: 'Changes',
    url: 'download.lineageos.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/lineageos/changes',
    parameters: undefined,
    description: undefined,
    categories: ['program-update'],
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
            source: ['download.lineageos.org/changes'],
            target: '/changes',
        },
    ],
    view: ViewType.Notifications,
};
