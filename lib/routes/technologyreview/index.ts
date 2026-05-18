import type { Route } from '@/types';

import { handler } from './ai';

export const route: Route = {
    path: ['', '/'],
    categories: ['new-media'],
    example: '/technologyreview',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Artificial Intelligence',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['www.technologyreview.com/topic/artificial-intelligence/'],
            target: '/technologyreview',
        },
    ],
    handler,
};
