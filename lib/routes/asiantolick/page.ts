import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/page/:id',
    categories: ['picture'],
    example: '/asiantolick/page/news',
    parameters: {
        id: 'Page id',
    },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['asiantolick.com/page/:id'],
            target: '/page/:id',
        },
    ],
    name: 'Page',
    maintainers: ['nczitzk'],
    handler,
    url: 'asiantolick.com/',
};
