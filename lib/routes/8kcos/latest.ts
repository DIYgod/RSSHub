import type { Route } from '@/types';

import { getPosts, SUB_NAME_PREFIX, SUB_URL } from './utils';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/8kcos',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['8kcosplay.com/'],
        },
    ],
    name: '最新',
    maintainers: ['KotoriK'],
    handler,
    url: '8kcosplay.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? 10, 10);
    const items = await getPosts(limit);
    return {
        title: `${SUB_NAME_PREFIX}-最新`,
        link: SUB_URL,
        item: items,
    };
}
