import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/new-podcasts',
    categories: ['multimedia'],
    example: '/xyzrank/new-podcasts',
    radar: [
        {
            source: ['xyzrank.com/'],
            target: '/new-podcasts',
        },
    ],
    name: '新锐播客',
    maintainers: ['nczitzk'],
    handler,
    url: 'xyzrank.com/',
};
