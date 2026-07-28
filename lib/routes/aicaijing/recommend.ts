import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/recommend',
    categories: ['finance'],
    example: '/aicaijing/recommend',
    radar: [
        {
            source: ['/'],
            target: '/recommend',
        },
    ],
    name: '推荐资讯',
    maintainers: ['nczitzk'],
    handler,
};
