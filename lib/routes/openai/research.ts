import type { Context } from 'hono';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { BASE_URL, fetchArticles } from './common';

export const route: Route = {
    path: '/research',
    categories: ['programming'],
    example: '/openai/research',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Research',
    maintainers: ['yuguorui', 'chesha1'],
    handler,
};

async function handler(ctx: Context) {
    const limit = getRouteLimit(ctx, 10);
    const link = new URL('/research/index', BASE_URL).href;

    return {
        title: 'OpenAI Research',
        link,
        item: await fetchArticles(limit, 'Research'),
    };
}
