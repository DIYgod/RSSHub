import { type Data, type Route, ViewType } from '@/types';

import { getCurrentPath } from '@/utils/helpers';
import { type Context } from 'hono';

import { baseUrl, processItems } from './util';

export const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('articles', baseUrl).href;
    const apiUrl: string = new URL(`gapi/v1/articles`, baseUrl).href;

    const query = {
        'filter[is-news]': 0,
    };

    return await processItems(limit, query, apiUrl, targetUrl);
};

export const route: Route = {
    path: '/articles',
    name: '文章',
    url: 'www.gcores.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/gcores/articles',
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
            source: ['www.gcores.com/articles'],
            target: '/gcores/articles',
        },
    ],
    view: ViewType.Articles,
};
