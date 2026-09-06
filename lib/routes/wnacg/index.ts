import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: '最新',
    maintainers: ['KenMizz'],
    path: '/',
    example: '/wnacg',
    radar: [
        {
            source: ['wnacg.com/albums.html', 'wnacg.com/'],
        },
    ],
    handler,
    url: 'wnacg.com/albums.html',
    features: {
        nsfw: true,
    },
};
