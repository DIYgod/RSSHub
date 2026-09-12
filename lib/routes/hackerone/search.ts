import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchHacktivityEdges, parseItem } from './utils';

export const route: Route = {
    path: '/search/:search',
    categories: ['other'],
    example: '/hackerone/search/rocket_chat',
    parameters: {
        search: 'Search string',
    },
    name: 'Search',
    maintainers: ['imlonghao'],
    handler,
};

async function handler(ctx: Context) {
    const { search } = ctx.req.param();
    const edges = await fetchHacktivityEdges(search);

    return {
        title: 'HackerOne Hacker Activity',
        link: `https://hackerone.com/hacktivity?querystring=${search}`,
        item: edges.map((item) => parseItem(item)),
    };
}
