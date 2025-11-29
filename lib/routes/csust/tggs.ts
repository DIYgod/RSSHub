import type { Route } from '@/types';

import { createCsustHandler } from './utils';

const handler = createCsustHandler({
    listPath: '/tggs.htm',
    feedTitle: '长沙理工大学 - 通告公示',
    feedDescription: '长沙理工大学通告公示',
});

export const route: Route = {
    path: '/tggs',
    categories: ['university'],
    example: '/csust/tggs',
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
            source: ['www.csust.edu.cn/tggs.htm', 'www.csust.edu.cn/'],
        },
    ],
    name: '通告公示',
    maintainers: ['powerfullz'],
    handler,
    url: 'www.csust.edu.cn/tggs.htm',
};
