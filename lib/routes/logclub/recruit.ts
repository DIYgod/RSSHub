import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/recruit',
    categories: ['new-media'],
    example: '/logclub/recruit',
    radar: [
        {
            source: ['logclub.com/recruit'],
            target: '/recruit',
        },
    ],
    name: '招聘',
    maintainers: ['nczitzk'],
    handler,
};
