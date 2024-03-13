import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/player_news/:id',
    categories: ['new-media'],
    example: '/dongqiudi/player_news/50000339',
    parameters: { id: '球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '球员新闻',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const playerId = ctx.req.param('id');

    await utils.ProcessFeed(ctx, 'player', playerId);
}
