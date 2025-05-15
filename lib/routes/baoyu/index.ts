import { Route, DataItem } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import cache from '@/utils/cache';

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
    maintainers: ['liyaozhong'],
    handler,
    description: '宝玉 - 博客文章',
};

async function handler() {
    const rootUrl = 'https://baoyu.io';
    const feedUrl = `${rootUrl}/feed.xml`;

    const feed = await parser.parseURL(feedUrl);

    const items = await Promise.all(
        feed.items.map((item) => {
            const link = item.link;

            return cache.tryGet(link as string, async () => {
                const response = await got(link);
                const $ = load(response.data);

                const container = $('.container');
                const content = container.find('.prose').html() || '';

                return {
                    title: item.title,
                    description: content,
                    link,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    author: item.creator || '宝玉',
                } as DataItem;
            });
        })
    );

    return {
        title: '宝玉的博客',
        link: rootUrl,
        item: items,
    };
}
