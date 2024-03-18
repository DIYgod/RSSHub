import { Route } from '@/types';
import parser from '@/utils/rss-parser';

import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media'],
    example: '/qbitai/category/资讯',
    parameters: { category: '分类名，见下表' },
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
            source: ['qbitai.com/category/:category'],
        },
    ],
    name: '分类',
    maintainers: ['FuryMartin'],
    handler,
    description: `| 资讯 | 数码     | 智能车 | 智库  | 活动    |
| ---- | -------- | ------ | ----- | ------- |
| 资讯 | ebandeng | auto   | zhiku | huodong |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const link = encodeURI(`https://www.qbitai.com/category/${category}/feed`);
    const feed = await parser.parseURL(link);

    const items = feed.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.pubDate),
        link: item.link,
        author: '量子位',
        category: item.categories,
        description: item['content:encoded'],
    }));

    return {
        // 源标题
        title: `量子位-${category}`,
        // 源链接
        link: `https://www.qbitai.com/category/${category}`,
        // 源文章
        item: items,
    };
}
