import type { Route } from '@/types';

import { fetchList } from './utils';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/nciae/tzgg',
    name: '通知公告',
    maintainers: ['SunShinenny'],
    handler,
};

function handler() {
    return fetchList('tzgg', '通知公告');
}
