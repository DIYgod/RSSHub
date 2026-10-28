import type { Context } from 'hono';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { fetchFeed } from './utils';

export const handler = (ctx: Context) => {
    const limit = getRouteLimit(ctx, 10);

    return fetchFeed(limit);
};

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/tailwindcss/blog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Blog',
    maintainers: ['goestav'],
    handler,
};
