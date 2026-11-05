import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: '分类',
    path: '/category/:id',
    example: '/cnbeta/category/movie',
    maintainers: ['nczitzk'],
    parameters: {
        id: '分类 id，可在对应分类页的 URL 中找到',
    },
    radar: [
        {
            source: ['cnbeta.com.tw/category/:id', 'www.cnbeta.com.tw/category/:id'],
            target: '/category/:id',
        },
    ],
    handler,
    url: 'cnbeta.com.tw',
    description: `| 影视  | 音乐  | 游戏 | 动漫  | 趣闻  | 科学    | 软件 |
| ----- | ----- | ---- | ----- | ----- | ------- | ---- |
| movie | music | game | comic | funny | science | soft |`,
};
