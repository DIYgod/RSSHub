import { Route } from '@/types';
import { Context } from 'hono';
import { fetchFeed } from './utils';

export const handler = (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') || '10');

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
