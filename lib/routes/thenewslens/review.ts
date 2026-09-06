import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/review/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/review',
    parameters: { sort: '排序方式，同上表，可在对应排序页 URL 中找到' },
    radar: [
        {
            source: ['thenewslens.com/review/:sort?', 'thenewslens.com/'],
            target: '/review/:sort?',
        },
    ],
    name: '评论',
    maintainers: ['nczitzk'],
    handler,
};
