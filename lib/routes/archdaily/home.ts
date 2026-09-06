import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/archdaily',
    parameters: {},
    name: 'Home',
    maintainers: ['kt286'],
    handler,
};

async function handler() {
    const feed = await parser.parseURL('https://feeds.feedburner.com/ArchdailyCN');

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                return {
                    title: item.title,
                    description: $('#single-content').html(),
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item.author,
                };
            })
        )
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        item: items as DataItem[],
    };
}
