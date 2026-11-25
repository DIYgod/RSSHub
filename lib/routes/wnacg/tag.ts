import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: '標籤更新',
    maintainers: ['Gandum2077'],
    path: '/tag/:tag',
    example: '/wnacg/tag/漢化',
    radar: [
        {
            source: ['wnacg.com/albums-index-tag-:tag.html'],
            target: '/tag/:tag',
        },
    ],
    handler,
    url: 'wnacg.com/albums.html',
    features: {
        nsfw: true,
    },
};
