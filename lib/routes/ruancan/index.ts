import type { Route } from '@/types';

import { fetchFeed } from './utils';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/ruancan',
    radar: [
        {
            source: ['ruancan.com/'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'ruancan.com/',
};

async function handler(ctx) {
    const currentUrl = '';

    return await fetchFeed(ctx, currentUrl);
}
