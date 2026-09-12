import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/zxtz',
    categories: ['government'],
    example: '/gov/cnca/zxtz',
    name: '通知',
    maintainers: ['Yoge-Code'],
    handler,
};

function handler() {
    return getFeed(`zwxx/tz/${new Date().getFullYear()}`, '通知');
}
