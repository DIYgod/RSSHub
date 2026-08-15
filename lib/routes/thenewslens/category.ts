import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/category/:id/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/category/politics',
    parameters: { id: '分类 id，可在对应分类页 URL 中找到', sort: '排序方式，同上表，可在对应排序页 URL 中找到' },
    radar: [
        {
            source: ['thenewslens.com/category/:id/:sort?', 'thenewslens.com/'],
            target: '/category/:id/:sort?',
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
};
