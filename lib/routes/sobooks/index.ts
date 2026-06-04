import type { Route } from '@/types';

import utils from './utils';

export const route: Route = {
    path: '/:category?',
    categories: ['reading'],
    example: '/sobooks',
    parameters: { category: '分类, 见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sobooks.net/:category'],
            target: '/:category',
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类     | 分类名           |
| -------- | ---------------- |
| 小说文学 | xiaoshuowenxue   |
| 历史传记 | lishizhuanji     |
| 人文社科 | renwensheke      |
| 励志成功 | lizhichenggong   |
| 经济管理 | jingjiguanli     |
| 学习教育 | xuexijiaoyu      |
| 生活时尚 | shenghuoshishang |
| 英文原版 | yingwenyuanban   |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    return await utils(ctx, category);
}
