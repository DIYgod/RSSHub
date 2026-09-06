import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/channel/:id/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/channel/hk',
    parameters: { id: '标签 id，可在对应标签页 URL 中找到', sort: '排序方式，同上表，可在对应排序页 URL 中找到' },
    radar: [
        {
            source: ['thenewslens.com/channel/:id/:sort?', 'thenewslens.com/'],
            target: '/channel/:id/:sort?',
        },
    ],
    name: '频道',
    maintainers: ['nczitzk'],
    handler,
};
