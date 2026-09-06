import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/bps',
    categories: ['government'],
    example: '/gov/caict/bps',
    name: '蓝皮书',
    maintainers: ['nczitzk'],
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    handler,
    url: 'www.caict.ac.cn/kxyj/qwfb/bps/',
};

function handler() {
    return getFeed('kxyj/qwfb/bps', 'td[width="540"]', ($) => $('div.pagemain').parent().parent().parent().html());
}
