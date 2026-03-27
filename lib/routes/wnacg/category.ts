import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: '分类更新',
    maintainers: ['Gandum2077'],
    path: '/category/:cid',
    example: '/wnacg/category/6',
    radar: [
        {
            source: ['wnacg.com/*'],
            target: (_, url) => `/wnacg/category/${new URL(url).pathname.match(/albums-index-cate-(\d+)\.html$/)[1]}`,
        },
    ],
    handler,
    url: 'wnacg.com/albums.html',
    features: {
        nsfw: true,
    },
};
