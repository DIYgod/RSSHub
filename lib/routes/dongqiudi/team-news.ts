import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/team_news/:team',
    categories: ['new-media', 'popular'],
    example: '/dongqiudi/team_news/50001755',
    parameters: { team: '球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到' },
    radar: [
        {
            source: ['www.dongqiudi.com/team/*team'],
            target: (params) => `/dongqiudi/team_news/${params.team.replace('.html', '')}`,
        },
    ],
    name: '球队新闻',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const teamId = ctx.req.param('team');

    return await utils.ProcessFeed(ctx, 'team', teamId);
}
