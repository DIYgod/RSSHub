import type { Route } from '@/types';

import { getBrookingsFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/topics/u-s-economy/`;

export const route: Route = {
    path: '/us-economy',
    categories: ['traditional-media'],
    example: '/brookings/us-economy',
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
            source: ['brookings.edu/topics/u-s-economy/'],
            target: '/brookings/us-economy',
        },
    ],
    name: 'U.S. Economy',
    maintainers: ['maxlixiang'],
    handler,
    url: 'www.brookings.edu/topics/u-s-economy/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getBrookingsFeed({
        currentUrl,
        title: 'Brookings - U.S. Economy',
        description: 'Brookings research and commentary on the U.S. economy.',
        limit,
    });
}
