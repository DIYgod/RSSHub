import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/baoyu/blog',
    radar: [
        {
            source: ['baoyu.io/'],
        },
    ],
    url: 'baoyu.io/',
    name: 'Blog',
    maintainers: ['liyaozhong', 'Circloud'],
    handler,
    description: '宝玉 - 博客文章',
};

async function handler() {
    const rootUrl = 'https://baoyu.io';
    const feedUrl = `${rootUrl}/feed.xml`;

    const response = await ofetch(feedUrl);
    const feed = await parser.parseString(response);

    const items = await Promise.all(
        feed.items.map((item) => {
            const link = item.link;
            if (!link) {
                throw new Error(`baoyu: feed item "${item.title}" has no link`);
            }

            return cache.tryGet(link, async () => {
                const response = await ofetch(link);
                const $ = load(response);

                const container = $('.container');
                const content = container.find('.prose').html();

                return {
                    title: item.title,
                    description: content,
                    link,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    author: item.creator || '宝玉',
                };
            });
        })
    );

    return {
        title: '宝玉的博客',
        link: rootUrl,
        item: items.filter((item): item is typeof item & { title: string } => item.title !== undefined),
    };
}
