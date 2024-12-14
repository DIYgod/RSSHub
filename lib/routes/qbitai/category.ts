import { Route } from '@/types';
import parser from '@/utils/rss-parser';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media', 'popular'],
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
    maintainers: ['FuryMartin, Geraldxm'],
    handler,
    description: `| 资讯 | 数码     | 智能车 | 智库  | 活动    |
| ---- | -------- | ------ | ----- | ------- |
| 资讯 | ebandeng | auto   | zhiku | huodong |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = encodeURI(`https://www.qbitai.com/category/${category}/feed`);

    const feed = await parser.parseURL(url);
    const entries = feed.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.pubDate),
        link: item.link,
        author: '量子位',
        category: item.categories,
        description: '', // Initialize description field
    }));

    const resolvedEntries = await Promise.all(
        entries.map((entry) =>
            cache.tryGet(entry.link, async () => {
                try {
                    const response = await ofetch(entry.link);
                    const $ = load(response);
                    entry.description = $('.article').html() || 'No content found';
                } catch {
                    entry.description = 'Failed to fetch content';
                }
                return entry;
            })
        )
    );

    return {
        title: `量子位 - ${category}`,
        link: `https://www.qbitai.com/category/${category}`,
        item: resolvedEntries,
    };
}
