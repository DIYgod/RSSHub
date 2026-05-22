import type { Route } from '@/types';

import { getCarnegieFeed, rootUrl } from './utils';

const currentUrl = `${rootUrl}/topics/ai`;

export const route: Route = {
    path: '/ai',
    categories: ['traditional-media'],
    example: '/carnegie/ai',
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
            source: ['carnegieendowment.org/topics/ai'],
            target: '/carnegie/ai',
        },
    ],
    name: 'AI',
    maintainers: ['maxlixiang'],
    handler,
    url: 'carnegieendowment.org/topics/ai',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    return await getCarnegieFeed({
        filterType: 'topics',
        slug: 'ai',
        title: 'Carnegie Endowment - AI',
        description: 'Carnegie Endowment research and commentary on AI.',
        link: currentUrl,
        limit,
    });
}
