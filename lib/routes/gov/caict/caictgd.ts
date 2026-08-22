import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/caictgd',
    categories: ['government'],
    example: '/gov/caict/caictgd',
    name: 'CAICT 观点',
    maintainers: ['nczitzk'],
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    handler,
    url: 'www.caict.ac.cn/kxyj/caictgd/',
};

function handler() {
    return getFeed('kxyj/caictgd', 'td[width="600"]', ($) => $('div.pagemaintext').html());
}
