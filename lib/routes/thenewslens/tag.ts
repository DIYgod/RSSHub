import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tag/:id/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/tag/中國',
    parameters: { id: '标签 id，可在对应标签页 URL 中找到', sort: '排序方式，同上表，可在对应排序页 URL 中找到' },
    radar: [
        {
            source: ['thenewslens.com/tag/:id/:sort?', 'thenewslens.com/'],
            target: '/tag/:id/:sort?',
        },
    ],
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
};
