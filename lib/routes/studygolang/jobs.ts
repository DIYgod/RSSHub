import type { Route } from '@/types';

import { FetchGoItems } from './utils';

export const route: Route = {
    path: '/jobs',
    categories: ['programming'],
    example: '/studygolang/jobs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '招聘',
    maintainers: ['CcccFz', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    return await FetchGoItems(ctx, 'jobs');
}
