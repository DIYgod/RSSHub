import type { Route } from '@/types';

import { handler } from './diplomacy';

export const route: Route = {
    path: ['', '/'],
    categories: ['traditional-media'],
    example: '/thediplomat',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Diplomacy',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['thediplomat.com/topics/diplomacy/'],
            target: '/thediplomat',
        },
    ],
    handler,
};
