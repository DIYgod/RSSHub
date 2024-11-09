// Warning: The author still knows nothing about javascript!
import { Route } from '@/types';

export const route: Route = {
    path: '/sem',
    categories: ['university'],
    example: '/tongji/sem',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '经济与管理学院通知',
    maintainers: ['sitdownkevin'],
    url: 'sem.tongji.edu.cn/semch/category/frontpage/notice',
    handler,
    description: ``,
};

import { getNotifByPage } from './_utils';

async function handler() {
    const promises = [];
    for (let i = 1; i <= 20; i++) {
        promises.push(getNotifByPage(i));
    }

    const results = await Promise.all(promises);

    // feed the data to rss
    return {
        title: '同济大学经济与管理学院',
        link: 'https://bksy.tongji.edu.cn/30359/list.htm',
        item: results.flat(),
    };
}
