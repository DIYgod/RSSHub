import type { Route } from '@/types';

import { getCmsItems } from './utils';

export const route: Route = {
    path: '/stxy',
    categories: ['university'],
    example: '/jsu/stxy',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '数学与统计学院 - 通知公告',
    maintainers: ['wenjia03'],
    handler,
};

async function handler() {
    const link = 'https://stxy.jsu.edu.cn/tzgg/index.htm';
    return {
        title: '吉首大学数学与统计学院 - 通知公告',
        link,
        description: '吉首大学数学与统计学院 - 通知公告',
        item: await getCmsItems(link, '通知公告'),
    };
}
