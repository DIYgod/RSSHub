// Warning: The author still knows nothing about javascript!
import { Route } from '@/types';
import { getNotifByPage, getArticle } from './_utils';
import cache from '@/utils/cache';

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
    const results: { title: string; link: string; pubDate: Date }[] = await getNotifByPage();
    const resultsWithContent = await Promise.all(results.map((item) => cache.tryGet(item.link, () => getArticle(item))));

    // feed the data to rss
    return {
        title: '同济大学经济与管理学院',
        description: '同济大学经济与管理学院官网通知',
        language: 'zh-cn',
        image: 'https://sem.tongji.edu.cn/semch/wp-content/themes/wood-themes-cn/images/pages/page_banner.gif',
        logo: 'https://tongji.edu.cn/images/badge.png',
        link: 'https://sem.tongji.edu.cn/semch',
        item: resultsWithContent,
    };
}
