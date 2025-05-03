import { type Data, type Route, ViewType } from '@/types';

import { type Context } from 'hono';

import { baseUrl, processItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('radios/preview', baseUrl).href;
    const apiUrl: string = new URL('gapi/v1/program-previews', baseUrl).href;

    const query = {
        'page[limit]': limit,
        include: 'radio.djs,video.djs,radio.category,video.category',
    };

    return await processItems(limit, query, apiUrl, targetUrl);
};

export const route: Route = {
    path: '/radios/preview',
    name: '预告',
    url: 'www.gcores.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/gcores/radios/preview',
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
            source: ['www.gcores.com/radios/preview'],
            target: '/gcores/radios/preview',
        },
    ],
    view: ViewType.Notifications,
};
