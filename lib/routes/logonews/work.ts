import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/work',
    categories: ['design'],
    example: '/logonews/work',
    radar: [
        {
            source: ['logonews.cn/work'],
            target: '/work',
        },
    ],
    name: '作品',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
};
