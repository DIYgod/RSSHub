import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/kuaixun',
    categories: ['new-media'],
    example: '/liulinblog/kuaixun',
    radar: [
        {
            source: ['liulinblog.com/kuaixun', 'liulinblog.com/'],
            target: '/kuaixun',
        },
    ],
    name: '60 秒读懂世界',
    maintainers: ['Fatpandac', 'nczitzk'],
    handler,
};
