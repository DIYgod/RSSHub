import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['new-media'],
    example: '/liulinblog/search/单机游戏',
    parameters: { keyword: '关键字' },
    radar: [
        {
            source: ['liulinblog.com/search/:keyword', 'liulinblog.com/'],
            target: '/search/:keyword',
        },
    ],
    name: '搜索',
    maintainers: ['nczitzk'],
    handler,
};
