import type { Route } from '@/types';

import { fetchList } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/nciae/news',
    name: '新闻',
    maintainers: ['SunShinenny'],
    handler,
};

function handler() {
    return fetchList('xw2', '新闻');
}
