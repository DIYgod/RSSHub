import type { Route } from '@/types';

import { fetchMetrCards } from './common';

const targetUrl = 'https://metr.org/research/';

export const route: Route = {
    path: '/research',
    categories: ['blog'],
    example: '/metr/research',
    name: 'Research',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['metr.org/research'],
            target: '/research',
        },
    ],
    url: 'metr.org/research/',
};

async function handler() {
    return {
        title: 'METR Research',
        description: 'Research from the METR team',
        link: targetUrl,
        item: await fetchMetrCards(targetUrl),
    };
}
