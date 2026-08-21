import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/author/:id/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/author/BBC',
    parameters: { id: '作者 id，可在对应作者页 URL 中找到', sort: '排序方式，同上表，可在对应排序页 URL 中找到' },
    radar: [
        {
            source: ['thenewslens.com/author/:id/:sort?', 'thenewslens.com/'],
            target: '/author/:id/:sort?',
        },
    ],
    name: '作者',
    maintainers: ['nczitzk'],
    handler,
};
