import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/report',
    categories: ['traditional-media'],
    example: '/pts/report',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.pts.org.tw/report', 'news.pts.org.tw/'],
        },
    ],
    name: '深度報導',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.pts.org.tw/report',
};
