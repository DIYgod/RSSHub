import type { Route } from '@/types';

import { fetchMetrCards } from './common';

const targetUrl = 'https://metr.org/blog';

export const route: Route = {
    path: '/updates',
    categories: ['blog'],
    example: '/metr/updates',
    name: 'Updates',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['metr.org/blog'],
            target: '/updates',
        },
    ],
    url: 'metr.org/blog',
};

async function handler() {
    return {
        title: 'METR Updates',
        description: 'Updates and writeups from METR',
        link: targetUrl,
        item: await fetchMetrCards(targetUrl),
    };
}
