import type { Route } from '@/types';

import { fetchFeed } from './utils';

export const route: Route = {
    path: '/user/:id',
    categories: ['new-media'],
    example: '/ruancan/user/72',
    parameters: { id: '用户 id，可在对应用户页 URL 中找到' },
    radar: [
        {
            source: ['ruancan.com/i/:id', 'ruancan.com/'],
        },
    ],
    name: '用户文章',
    maintainers: ['nczitzk'],
    handler,
    url: 'ruancan.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const currentUrl = `/i/${id}`;

    return await fetchFeed(ctx, currentUrl);
}
