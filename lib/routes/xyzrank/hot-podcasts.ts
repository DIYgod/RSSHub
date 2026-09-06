import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/hot-podcasts',
    categories: ['multimedia'],
    example: '/xyzrank/hot-podcasts',
    radar: [
        {
            source: ['xyzrank.com/'],
            target: '/hot-podcasts',
        },
    ],
    name: '热门播客',
    maintainers: ['nczitzk'],
    handler,
    url: 'xyzrank.com/',
};
