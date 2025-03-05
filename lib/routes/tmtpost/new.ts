import { type Data, type Route, ViewType } from '@/types';

import { type Context } from 'hono';

import { baseUrl, apiBaseUrl, processItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('new', baseUrl).href;
    const listApiUrl: string = new URL('v1/lists/new', apiBaseUrl).href;

    return await processItems(limit, {}, listApiUrl, targetUrl);
};

export const route: Route = {
    path: '/new',
    name: '最新',
    url: 'www.tmtpost.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/tmtpost/new',
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
            source: ['www.tmtpost.com'],
            target: '/new',
        },
    ],
    view: ViewType.Articles,
};
