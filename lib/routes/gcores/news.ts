import { type Data, type Route, ViewType } from '@/types';

import { type Context } from 'hono';

import { baseUrl, processItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('news', baseUrl).href;
    const apiUrl: string = new URL('gapi/v1/articles', baseUrl).href;

    const query = {
        'page[limit]': limit,
        sort: '-published-at',
        include: 'category,user,media',
        'filter[list-all]': 1,
        'filter[is-news]': 1,
    };

    return await processItems(limit, query, apiUrl, targetUrl);
};

export const route: Route = {
    path: '/news',
    name: '资讯',
    url: 'www.gcores.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/gcores/news',
    parameters: undefined,
    description: undefined,
    categories: ['game'],
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
            source: ['www.gcores.com/news'],
            target: '/gcores/news',
        },
    ],
    view: ViewType.Articles,
};
