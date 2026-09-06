import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/hot',
    categories: ['new-media'],
    example: '/toodaylab/hot',
    radar: [
        {
            source: ['toodaylab.com/posts'],
            target: '/hot',
        },
    ],
    name: '最热',
    maintainers: ['nczitzk'],
    handler,
};
