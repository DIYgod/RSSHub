import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchHacktivityEdges, parseItems } from './utils';

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
        link: `https://hackerone.com/hacktivity?${new URLSearchParams({ querystring: search })}`,
        item: await parseItems(edges),
    };
}
