import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/qwsj',
    categories: ['government'],
    example: '/gov/caict/qwsj',
    name: '权威数据',
    maintainers: ['nczitzk'],
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    handler,
    url: 'www.caict.ac.cn/kxyj/qwfb/qwsj/',
};

function handler() {
    return getFeed('kxyj/qwfb/qwsj', 'td[width="540"]');
}
