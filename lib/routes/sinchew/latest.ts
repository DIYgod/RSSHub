import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media'],
    example: '/sinchew/latest',
    radar: [
        {
            source: ['sinchew.com.my/latest', 'sinchew.com.my/'],
            target: '/latest',
        },
    ],
    name: '最新',
    maintainers: ['nczitzk'],
    handler,
};
