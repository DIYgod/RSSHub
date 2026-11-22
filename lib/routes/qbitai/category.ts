import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

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
    maintainers: ['FuryMartin', 'Geraldxm'],
    handler,
    description: `| 资讯 | 数码     | 智能车 | 智库  | 活动    |
| ---- | -------- | ------ | ----- | ------- |
| 资讯 | ebandeng | auto   | zhiku | huodong |`,
};

export async function getItems(feed: Awaited<ReturnType<typeof parser.parseURL>>) {
    const entries = feed.items.map((item) => ({
        title: item.title!,
        pubDate: parseDate(item.pubDate!),
        link: item.link,
        author: item.creator,
        category: item.categories,
        description: '', // Initialize description field
    }));

    const resolvedEntries = await pMap(
        entries,
        async (entry) => {
            const details = await cache.tryGet(`${entry.link}:qbitai-main-content`, async () => {
                const response = await ofetch(entry.link!);
                const $ = load(response);
                const body = $('.article');
                body.children('h1').first().remove();
                body.find('.article_info, .line_font').remove();
                const byline = body.children('blockquote').first();
                if (/量子位\s*\|\s*公众号\s*QbitAI/.test(byline.text())) {
                    byline.remove();
                }
                return { description: body.html() };
            });
            return { ...entry, ...details };
        },
        { concurrency: 3 }
    );

    return resolvedEntries;
}

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = encodeURI(`https://www.qbitai.com/category/${category}/feed`);

    const feed = await parser.parseURL(url);
    return {
        title: `量子位 - ${category}`,
        link: `https://www.qbitai.com/category/${category}`,
        item: await getItems(feed),
    };
}
