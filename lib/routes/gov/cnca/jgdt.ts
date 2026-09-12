import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/jgdt',
    categories: ['government'],
    example: '/gov/cnca/jgdt',
    name: '监管动态',
    maintainers: ['Yoge-Code'],
    handler,
};

function handler() {
    return getFeed('xwjj/jgdt', '监管动态');
}
