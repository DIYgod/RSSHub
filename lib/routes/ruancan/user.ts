import { Route } from '@/types';
import fetchFeed from './utils';

export const route: Route = {
    path: '/user/:id',
    radar: [
        {
            source: ['ruancan.com/i/:id', 'ruancan.com/'],
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'ruancan.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const currentUrl = `/i/${id}`;

    return await fetchFeed(ctx, currentUrl);
}
