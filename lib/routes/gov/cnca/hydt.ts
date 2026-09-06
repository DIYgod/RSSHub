import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/hydt',
    categories: ['government'],
    example: '/gov/cnca/hydt',
    name: '行业动态',
    maintainers: ['Yoge-Code'],
    handler,
};

function handler() {
    return getFeed('xwjj/xydt', '行业动态');
}
