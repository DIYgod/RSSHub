import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/cover',
    categories: ['finance'],
    example: '/aicaijing/cover',
    radar: [
        {
            source: ['www.aicaijing.com/'],
            target: '/cover',
        },
    ],
    name: '封面文章',
    maintainers: ['nczitzk'],
    handler,
};
