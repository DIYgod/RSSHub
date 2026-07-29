import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/opinion',
    categories: ['traditional-media'],
    example: '/pts/opinion',
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
            source: ['news.pts.org.tw/opinion', 'news.pts.org.tw/'],
        },
    ],
    name: '觀點',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.pts.org.tw/opinion',
};
