import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tender',
    categories: ['new-media'],
    example: '/logclub/tender',
    radar: [
        {
            source: ['/tender'],
            target: '/tender',
        },
    ],
    name: '招投标',
    maintainers: ['nczitzk'],
    handler,
};
