import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: '主题',
    path: '/topics/:id',
    example: '/cnbeta/topics/453',
    maintainers: ['cczhong11', 'nczitzk'],
    parameters: {
        id: '主题 id，可在对应主题页的 URL 中找到',
    },
    radar: [
        {
            source: ['cnbeta.com.tw/topics/:id', 'www.cnbeta.com.tw/topics/:id'],
            target: '/topics/:id',
        },
    ],
    handler,
    url: 'cnbeta.com.tw',
    description: `::: tip
完整的主题列表参见 [主题列表](https://www.cnbeta.com.tw/topics.htm)
:::`,
};
