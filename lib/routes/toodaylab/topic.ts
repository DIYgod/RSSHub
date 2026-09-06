import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media'],
    example: '/toodaylab/topic/309',
    parameters: { id: '话题 id，见下表，可在对应话题页 URL 中找到' },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['toodaylab.com/topic/:id'],
            target: '/topic/:id',
        },
    ],
    name: '话题',
    description: `| 今日消费资讯 | 实验室带你过周末 | 实验室带你过假期 | 每日一图 | 每周一书 | 实验室数字 | 新鲜社会人 | 实验室 TV |
| ------------ | ---------------- | ---------------- | -------- | -------- | ---------- | ---------- | --------- |
| 309          | 37               | 40               | 32       | 33       | 310        | 316        | 476       |`,
    maintainers: ['nczitzk'],
    handler,
};
