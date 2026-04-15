import type { Route } from '@/types';

import { fetchMetrCards } from './common';

const targetUrl = 'https://metr.org/notes/';

export const route: Route = {
    path: '/notes',
    categories: ['blog'],
    example: '/metr/notes',
    name: 'Notes',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['metr.org/notes'],
            target: '/notes',
        },
    ],
    url: 'metr.org/notes/',
};

async function handler() {
    return {
        title: 'METR Notes',
        description: 'Notes and short writeups from METR',
        link: targetUrl,
        item: await fetchMetrCards(targetUrl),
    };
}
