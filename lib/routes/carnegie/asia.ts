import type { Route } from '@/types';

import { getCarnegieFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/regions/asia`;

export const route: Route = {
    path: '/asia',
    categories: ['traditional-media'],
    example: '/carnegie/asia',
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
            source: ['carnegieendowment.org/regions/asia'],
            target: '/carnegie/asia',
        },
    ],
    name: 'Asia',
    maintainers: ['maxlixiang'],
    handler,
    url: 'carnegieendowment.org/regions/asia',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getCarnegieFeed({
        filterType: 'regions',
        slug: 'asia',
        title: 'Carnegie Endowment - Asia',
        description: 'Carnegie Endowment research and commentary on Asia.',
        link: currentUrl,
        limit,
    });
}
