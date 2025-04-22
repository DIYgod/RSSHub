import { type Data, type Route, ViewType } from '@/types';

import { type Context } from 'hono';

import { baseUrl, processItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('videos', baseUrl).href;
    const apiUrl: string = new URL('gapi/v1/videos', baseUrl).href;

    const query = {
        'page[limit]': limit,
        sort: '-published-at',
        include: 'category,user,media',
        'filter[list-all]': 1,
    };

    return await processItems(limit, query, apiUrl, targetUrl);
};

export const route: Route = {
    path: '/videos',
    name: '视频',
    url: 'www.gcores.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/gcores/videos',
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
            source: ['www.gcores.com/videos'],
            target: '/gcores/videos',
        },
    ],
    view: ViewType.Videos,
};
