import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/information/:id?',
    categories: ['finance'],
    example: '/aicaijing/information/14',
    parameters: {
        id: '栏目 id，可在对应栏目页 URL 中找到，默认为 14，即热点最新',
    },
    description: `| 栏目 id | 栏目        |
| ------- | ----------- |
| 14      | 热点 - 最新 |
| 5       | 热点 - 科技 |
| 9       | 热点 - 消费 |
| 7       | 热点 - 出行 |
| 13      | 热点 - 文娱 |
| 10      | 热点 - 教育 |
| 25      | 热点 - 地产 |
| 11      | 热点 - 更多 |
| 28      | 深度 - 出行 |
| 29      | 深度 - 科技 |
| 31      | 深度 - 消费 |
| 33      | 深度 - 教育 |
| 34      | 深度 - 更多 |
| 8       | 深度 - 地产 |
| 6       | 深度 - 文娱 |`,
    radar: [
        {
            source: ['www.aicaijing.com/information/:id', 'www.aicaijing.com/'],
            target: '/information/:id?',
        },
    ],
    name: '热点 & 深度',
    maintainers: ['nczitzk'],
    handler,
};
