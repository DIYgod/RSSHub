import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/field/:id',
    categories: ['new-media'],
    example: '/toodaylab/field/308',
    parameters: { id: '领域 id，见下表，可在对应领域页 URL 中找到' },
    radar: [
        {
            source: ['toodaylab.com/field/:id'],
            target: '/field/:id',
        },
    ],
    name: '领域',
    description: `| 快消 | 时尚 | 智能 | 娱乐 | 运动 | 生活 | 设计 | 出行 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 308  | 307  | 306  | 305  | 304  | 303  | 302  | 301  |`,
    maintainers: ['nczitzk'],
    handler,
};
