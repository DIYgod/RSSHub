import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/backlinko/blog',
    parameters: {},
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
            source: ['backlinko.com/blog', 'backlinko.com/'],
        },
    ],
    name: 'Blog',
    maintainers: ['TonyRL'],
    handler,
    url: 'backlinko.com/blog',
};

async function handler() {
    const baseUrl = 'https://backlinko.com';
    const { data } = await got(`${baseUrl}/feed`);
    const feed = await parser.parseString(data);
    const items = feed.items.map((item) => ({
        title: item.title ?? '',
        link: item.link,
        description: item['content:encoded'] ?? item.content,
        author: item.creator ?? item.author,
        category: item.categories,
        pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
    }));

    return {
        title: feed.title ?? 'Backlinko',
        description: feed.description,
        link: `${baseUrl}/blog`,
        language: 'en' as const,
        item: items,
    };
}
