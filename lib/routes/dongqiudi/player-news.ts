import type { Route } from '@/types';

import { processFeed } from './utils';

export const route: Route = {
    path: '/player_news/:id',
    categories: ['sport'],
    example: '/dongqiudi/player_news/50000339',
    parameters: { id: '球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到' },
    radar: [
        {
            source: ['www.dongqiudi.com/player/:id'],
            target: '/player_news/:id',
        },
    ],
    name: '球员新闻',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const playerId = ctx.req.param('id').replace(/\.html$/, '');

    return await processFeed(ctx, 'player', playerId);
}
