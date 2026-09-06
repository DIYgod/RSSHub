import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/hot-episodes-new',
    categories: ['multimedia'],
    example: '/xyzrank/hot-episodes-new',
    radar: [
        {
            source: ['xyzrank.com/'],
            target: '/hot-episodes-new',
        },
    ],
    name: '新锐节目',
    maintainers: ['nczitzk'],
    handler,
    url: 'xyzrank.com/',
};
