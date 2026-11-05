import pMap from 'p-map';

// Warning: The author still knows nothing about javascript!
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';

import { getArticle, getNotifList } from './_utils';

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
    description: '',
};

async function handler() {
    // feed the data to rss
    const items = await getNotifList();
    const itemsWithContent = await pMap(items, async (item) => ({ ...item, ...(await cache.tryGet(`scu-scupi:article-v2:${item.link}`, () => getArticle(item.link))) }), { concurrency: 3 });

    return {
        title: '四川大学匹兹堡学院',
        description: '四川大学匹兹堡学院官网通知',
        language: 'zh-CN' as const satisfies Language,
        image: 'https://upload.wikimedia.org/wikipedia/zh/4/45/Sichuan_University_logo.svg',
        logo: 'https://upload.wikimedia.org/wikipedia/zh/4/45/Sichuan_University_logo.svg',
        link: 'https://scupi.scu.edu.cn/',
        item: itemsWithContent,
    };
}
