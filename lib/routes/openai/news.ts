import type { Context } from 'hono';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { BASE_URL, fetchArticles } from './common';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/openai/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['goestav', 'StevenRCE0', 'nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const limit = getRouteLimit(ctx, 10);

    const link = new URL('/news/', BASE_URL).href;

    return {
        title: 'OpenAI News',
        link,
        item: await fetchArticles(limit),
    };
}
