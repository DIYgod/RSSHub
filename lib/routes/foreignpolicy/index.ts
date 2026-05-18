import type { Route } from '@/types';

import { handler } from './latest';

export const route: Route = {
    path: ['', '/'],
    categories: ['traditional-media'],
    example: '/foreignpolicy',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Latest',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['foreignpolicy.com/category/latest/'],
            target: '/foreignpolicy',
        },
    ],
    handler,
};
