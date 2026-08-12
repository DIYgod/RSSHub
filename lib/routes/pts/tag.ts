import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tag/:id',
    categories: ['traditional-media'],
    example: '/pts/tag/230',
    parameters: { id: '標籤 id，可在对应標籤页 URL 中找到' },
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
            source: ['news.pts.org.tw/tag/:id', 'news.pts.org.tw/'],
        },
    ],
    name: '標籤',
    maintainers: ['nczitzk'],
    handler,
};
