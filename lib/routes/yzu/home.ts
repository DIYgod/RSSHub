import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchList } from './utils';

const map = new Map([
    ['xxyw', '学校要闻'],
    ['xyxw', '校园新闻'],
    ['xxgg', '信息公告'],
    ['xshd', '学术活动'],
    ['mtyd', '媒体扬大'],
]);

export const route: Route = {
    path: '/home/:type',
    categories: ['university'],
    example: '/yzu/home/xxyw',
    parameters: { type: '分类名' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.yzu.edu.cn/dtxx/:type.htm'],
            target: '/home/:type',
        },
    ],
    name: '官网消息',
    maintainers: ['LogicJake'],
    handler,
    description: `| 学校要闻 | 校园新闻 | 信息公告 | 学术活动 | 媒体扬大 |
| -------- | -------- | -------- | -------- | -------- |
| xxyw     | xyxw     | xxgg     | xshd     | mtyd     |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;
    const link = `https://www.yzu.edu.cn/dtxx/${type}.htm`;

    const items = await fetchList(link, limit);

    return {
        title: `扬州大学 -- ${map.get(type)}`,
        link,
        description: '扬州大学 RSS',
        item: items,
    };
}
