import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/team_news/:team',
    categories: ['new-media'],
    example: '/dongqiudi/team_news/50001755',
    parameters: { team: '球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '球队新闻',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const teamId = ctx.req.param('team');

    await utils.ProcessFeed(ctx, 'team', teamId);
}
