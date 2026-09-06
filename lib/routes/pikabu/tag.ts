import type { Route } from '@/types';

import { handler } from './community';

export const route: Route = {
    path: '/tag/:name',
    categories: ['bbs'],
    example: '/pikabu/tag/Metallica',
    parameters: { name: 'Tag name' },
    radar: [
        {
            source: ['pikabu.ru/tag/:name'],
            target: '/tag/:name',
        },
    ],
    name: 'Tag',
    maintainers: ['TonyRL'],
    handler,
};
