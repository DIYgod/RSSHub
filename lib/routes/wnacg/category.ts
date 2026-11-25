import type { Route } from '@/types';

import { categories, handler } from './common';

export const route: Route = {
    name: '分类更新',
    maintainers: ['Gandum2077'],
    path: '/category/:cid',
    example: '/wnacg/category/6',
    radar: Object.keys(categories).map((cid) => ({
        source: [`wnacg.com/albums-index-cate-${cid}.html`],
        target: `/category/${cid}`,
    })),
    handler,
    url: 'wnacg.com/albums.html',
    features: {
        nsfw: true,
    },
};
