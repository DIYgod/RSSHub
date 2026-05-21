import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/yw',
    name: '\u8981\u95fb',
    url: 'www.stcn.com/article/list/yw.html',
    maintainers: ['maxlixiang'],
    handler,
    example: '/stcn/yw',
    categories: ['finance'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.stcn.com/article/list/yw.html'],
            target: '/yw',
        },
    ],
    view: ViewType.Articles,
};
