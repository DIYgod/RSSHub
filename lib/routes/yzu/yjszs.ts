import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchList } from './utils';

const map = new Map([
    ['tzgg', { title: '通知公告', page: 'tzgg' }],
    ['bszs', { title: '博士研究生招生', page: 'bsyjszs' }],
    ['sszs', { title: '硕士研究生招生', page: 'ssyjszs' }],
]);

export const route: Route = {
    path: '/yjszs/:type',
    categories: ['university'],
    example: '/yzu/yjszs/tzgg',
    parameters: { type: '分类名' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    radar: [
        {
            title: '通知公告',
            source: ['yjszs.yzu.edu.cn/tzgg/tzgg.htm'],
            target: '/yjszs/tzgg',
        },
        {
            title: '博士研究生招生',
            source: ['yjszs.yzu.edu.cn/tzgg/bsyjszs.htm'],
            target: '/yjszs/bszs',
        },
        {
            title: '硕士研究生招生',
            source: ['yjszs.yzu.edu.cn/tzgg/ssyjszs.htm'],
            target: '/yjszs/sszs',
        },
    ],
    name: '研究生招生',
    maintainers: ['LogicJake'],
    handler,
    description: `| 通知公告 | 博士研究生招生 | 硕士研究生招生 |
| -------- | -------------- | -------------- |
| tzgg     | bszs           | sszs           |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const { title, page } = map.get(type)!;
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;
    const link = `https://yjszs.yzu.edu.cn/tzgg/${page}.htm`;

    const items = await fetchList(link, limit);

    return {
        title: `扬州大学研究生招生 -- ${title}`,
        link,
        description: '扬州大学研究生招生 RSS',
        item: items,
    };
}
