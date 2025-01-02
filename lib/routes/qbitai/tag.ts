import { Route } from '@/types';
import parser from '@/utils/rss-parser';

import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['new-media', 'popular'],
    example: '/qbitai/tag/大语言模型',
    parameters: { tag: '标签名' },
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
            source: ['qbitai.com/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['FuryMartin'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const link = encodeURI(`https://www.qbitai.com/tag/${tag}/feed`);
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
        title: `量子位-${tag}`,
        // 源链接
        link: `https://www.qbitai.com/tag/${tag}`,
        // 源文章
        item: items,
    };
}
