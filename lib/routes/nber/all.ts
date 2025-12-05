import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: 'All Papers',
    maintainers: ['5upernova-heng'],
    path: '/papers',
    example: '/nber/papers',
    features: {
        supportScihub: true,
    },
    radar: [
        {
            source: ['nber.org/papers'],
        },
    ],
    handler,
    url: 'nber.org/papers',
};
