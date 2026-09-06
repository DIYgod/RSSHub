import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/news/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/news',
    parameters: { sort: '排序方式，见下表，可在对应排序页 URL 中找到' },
    description: `| 最新文章 | 最多觀看 | 最多分享 |
| -------- | -------- | -------- |
|          | hot      | social   |`,
    radar: [
        {
            source: ['thenewslens.com/news/:sort?', 'thenewslens.com/'],
            target: '/news/:sort?',
        },
    ],
    name: '新闻',
    maintainers: ['nczitzk'],
    handler,
};
