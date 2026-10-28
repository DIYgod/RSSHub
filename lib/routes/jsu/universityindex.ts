import type { Route } from '@/types';

import { getCmsItems } from './utils';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/jsu/notice',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知公告',
    maintainers: ['wenjia03'],
    handler,
};

async function handler() {
    const link = 'https://www.jsu.edu.cn/xwzx/tzgg/index.htm';
    return {
        title: '吉首大学 - 通知公告',
        link,
        description: '吉首大学 - 通知公告',
        item: await getCmsItems(link, '通知公告'),
    };
}
