import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['picture'],
    example: '/asiantolick/search/lolita',
    parameters: {
        keyword: 'Keyword',
    },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['asiantolick.com/search/:keyword'],
            target: '/search/:keyword',
        },
    ],
    name: 'Search',
    maintainers: ['nczitzk'],
    handler,
    url: 'asiantolick.com/',
};
