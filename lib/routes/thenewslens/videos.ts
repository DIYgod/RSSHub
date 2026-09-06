import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/videos/Projects/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/videos/Projects',
    parameters: { sort: '排序方式，同上表，可在对应排序页 URL 中找到' },
    radar: [
        {
            source: ['thenewslens.com/videos/Projects/:sort?'],
            target: '/videos/Projects/:sort?',
        },
    ],
    name: '影音',
    maintainers: ['nczitzk'],
    handler,
};
