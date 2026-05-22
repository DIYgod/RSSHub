import type { Route } from '@/types';

import { getCarnegieFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/regions/americas`;

export const route: Route = {
    path: '/americas',
    categories: ['traditional-media'],
    example: '/carnegie/americas',
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
            source: ['carnegieendowment.org/regions/americas'],
            target: '/carnegie/americas',
        },
    ],
    name: 'Americas',
    maintainers: ['maxlixiang'],
    handler,
    url: 'carnegieendowment.org/regions/americas',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getCarnegieFeed({
        filterType: 'regions',
        slug: 'americas',
        title: 'Carnegie Endowment - Americas',
        description: 'Carnegie Endowment research and commentary on the Americas.',
        link: currentUrl,
        limit,
    });
}
