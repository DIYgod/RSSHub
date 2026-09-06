import type { Route } from '@/types';

import { fetchList } from './utils';

export const route: Route = {
    path: '/xsxx',
    categories: ['university'],
    example: '/nciae/xsxx',
    name: '学术信息',
    maintainers: ['SunShinenny'],
    handler,
};

function handler() {
    return fetchList('xsxx', '学术信息');
}
