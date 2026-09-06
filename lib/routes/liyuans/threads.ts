import type { Route } from '@/types';

import { fetchThreads } from './utils';

export const route: Route = {
    path: '/threads',
    categories: ['bbs'],
    example: '/liyuans/threads',
    name: '主题帖（全站）',
    maintainers: ['WooMai'],
    handler,
};

async function handler() {
    return await fetchThreads();
}
