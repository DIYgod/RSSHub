import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/original',
    categories: ['new-media'],
    example: '/logclub/original',
    radar: [
        {
            source: ['logclub.com/original'],
            target: '/original',
        },
    ],
    name: '原创',
    maintainers: ['nczitzk'],
    handler,
};
