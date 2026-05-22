import type { Route } from '@/types';

import { getBrookingsFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/regions/middle-east-north-africa/iran/`;

export const route: Route = {
    path: '/iran',
    categories: ['traditional-media'],
    example: '/brookings/iran',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['brookings.edu/regions/middle-east-north-africa/iran/'],
            target: '/brookings/iran',
        },
    ],
    name: 'Iran',
    maintainers: ['maxlixiang'],
    handler,
    url: 'www.brookings.edu/regions/middle-east-north-africa/iran/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getBrookingsFeed({
        currentUrl,
        title: 'Brookings - Iran',
        description: 'Brookings research and commentary on Iran.',
        limit,
    });
}
