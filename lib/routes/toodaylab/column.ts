import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/column/:id',
    categories: ['new-media'],
    example: '/toodaylab/column/299',
    parameters: { id: '专栏 id，见下表，可在对应专栏页 URL 中找到' },
    radar: [
        {
            source: ['toodaylab.com/column/:id'],
            target: '/column/:id',
        },
    ],
    name: '专栏',
    description: `| 专题 | 攻略 |
| ---- | ---- |
| 299  | 300  |`,
    maintainers: ['nczitzk'],
    handler,
};
