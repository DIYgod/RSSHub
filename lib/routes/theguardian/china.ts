import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/china',
    categories: ['traditional-media'],
    example: '/theguardian/china',
    radar: [
        {
            source: ['www.theguardian.com/world/china'],
        },
    ],
    name: 'China',
    maintainers: ['Polynomia'],
    handler,
};

function handler() {
    return getFeed({
        link: 'https://www.theguardian.com/world/china',
        title: 'China',
        rss: 'https://www.theguardian.com/world/china/rss',
    });
}
