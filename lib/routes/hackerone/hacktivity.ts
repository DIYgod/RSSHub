import type { Route } from '@/types';

import { fetchHacktivityEdges, parseItem } from './utils';

export const route: Route = {
    path: '/hacktivity',
    categories: ['other'],
    example: '/hackerone/hacktivity',
    radar: [
        {
            source: ['hackerone.com/hacktivity'],
        },
    ],
    name: 'Hacker Activity',
    maintainers: ['imlonghao'],
    handler,
};

async function handler() {
    const edges = await fetchHacktivityEdges('disclosed:true');

    return {
        title: 'HackerOne Hacker Activity',
        link: 'https://hackerone.com/hacktivity',
        item: edges.map((item) => parseItem(item)),
    };
}
