import type { Route } from '@/types';

import { getCarnegieFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/regions/russia-and-eurasia`;

export const route: Route = {
    path: '/russia-and-eurasia',
    categories: ['traditional-media'],
    example: '/carnegie/russia-and-eurasia',
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
            source: ['carnegieendowment.org/regions/russia-and-eurasia'],
            target: '/carnegie/russia-and-eurasia',
        },
    ],
    name: 'Russia and Eurasia',
    maintainers: ['maxlixiang'],
    handler,
    url: 'carnegieendowment.org/regions/russia-and-eurasia',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getCarnegieFeed({
        filterType: 'regions',
        slug: 'russia-and-eurasia',
        title: 'Carnegie Endowment - Russia and Eurasia',
        description: 'Carnegie Endowment research and commentary on Russia and Eurasia.',
        link: currentUrl,
        limit,
    });
}
