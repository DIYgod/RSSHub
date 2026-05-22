import type { Route } from '@/types';

import { getCarnegieFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/regions/iran`;

export const route: Route = {
    path: '/iran',
    categories: ['traditional-media'],
    example: '/carnegie/iran',
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
            source: ['carnegieendowment.org/regions/iran'],
            target: '/carnegie/iran',
        },
    ],
    name: 'Iran',
    maintainers: ['maxlixiang'],
    handler,
    url: 'carnegieendowment.org/regions/iran',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getCarnegieFeed({
        filterType: 'regions',
        slug: 'iran',
        title: 'Carnegie Endowment - Iran',
        description: 'Carnegie Endowment research and commentary on Iran.',
        link: currentUrl,
        limit,
    });
}
