import type { Route } from '@/types';

import fetchFeed from './utils';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['ruancan.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'ruancan.com/',
};

async function handler(ctx) {
    const currentUrl = '';

    return await fetchFeed(ctx, currentUrl);
}
