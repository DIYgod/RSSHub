// Warning: The author still knows nothing about javascript!
import { Route } from '@/types';
import { getNotifByPage } from './_utils';

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

async function handler() {
    const results = await getNotifByPage();

    // feed the data to rss
    return {
        title: '同济大学经济与管理学院',
        link: 'https://sem.tongji.edu.cn/semch/category/frontpage/notice',
        item: results,
    };
}
