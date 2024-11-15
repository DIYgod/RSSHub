// Warning: The author still knows nothing about javascript!

import { getNotifList, getArticle } from './_utils';
import { Route } from '@/types';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/scupi',
    categories: ['university'],
    example: '/scu/scupi',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '匹兹堡学院通知',
    maintainers: ['sitdownkevin'],
    url: 'scupi.scu.edu.cn/activities/notice',
    handler,
    description: ``,
};

async function handler() {
    // feed the data to rss
    const items = await getNotifList();
    const itemsWithContent = await Promise.all(items.map((item) => cache.tryGet(item.link, () => getArticle(item))));

    return {
        title: '四川大学匹兹堡学院',
        description: '四川大学匹兹堡学院官网通知',
        language: 'zh-cn',
        image: 'https://scupi.scu.edu.cn/wp-content/themes/scupi/img/logo.png',
        link: 'https://scupi.scu.edu.cn/',
        item: itemsWithContent,
    };
}
