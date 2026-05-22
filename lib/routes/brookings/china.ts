import type { Route } from '@/types';

import { getBrookingsFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/regions/asia-the-pacific/china/`;

export const route: Route = {
    path: '/china',
    categories: ['traditional-media'],
    example: '/brookings/china',
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
            source: ['brookings.edu/regions/asia-the-pacific/china/'],
            target: '/brookings/china',
        },
    ],
    name: 'China',
    maintainers: ['maxlixiang'],
    handler,
    url: 'www.brookings.edu/regions/asia-the-pacific/china/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getBrookingsFeed({
        currentUrl,
        title: 'Brookings - China',
        description: 'Brookings research and commentary on China.',
        limit,
    });
}
