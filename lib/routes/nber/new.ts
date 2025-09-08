import { Route } from '@/types';
import { handler } from './common';

export const route: Route = {
    name: 'New Papers',
    maintainers: ['5upernova-heng'],
    path: '/new',
    example: '/nber/new',
    features: {
        supportScihub: true,
    },
    radar: [
        {
            source: ['nber.org/papers'],
        },
    ],
    handler,
    url: 'nber.org/papers',
    description: 'Papers that are published in this week.',
};
