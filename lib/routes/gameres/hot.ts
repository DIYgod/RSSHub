import type { Route } from '@/types';

import { getFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/hot',
    categories: ['game'],
    example: '/gameres/hot',
    name: '热点推荐',
    maintainers: ['nczitzk'],
    handler,
};

function handler() {
    return getFeed(rootUrl, '.hot-item h3');
}
