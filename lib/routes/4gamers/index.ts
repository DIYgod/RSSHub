import type { Route } from '@/types';

import { handler } from './category';

export const route: Route = {
    path: '/',
    categories: ['game'],
    example: '/4gamers',
    radar: [
        {
            source: ['www.4gamers.com.tw/news', 'www.4gamers.com.tw/'],
            target: '/',
        },
    ],
    name: '最新消息',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.4gamers.com.tw/news',
};
