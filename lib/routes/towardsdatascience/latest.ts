import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/latest',
    categories: ['blog'],
    example: '/towardsdatascience/latest',
    radar: [
        {
            source: ['towardsdatascience.com/'],
        },
    ],
    name: 'Latest articles',
    maintainers: ['mintyfrankie'],
    url: 'towardsdatascience.com/latest',
    handler,
};

async function handler() {
    const feed = await parser.parseURL('https://towardsdatascience.com/feed/');

    return {
        title: 'Towards Data Science - Latest',
        language: 'en' as const,
        description: 'Latest articles from Towards Data Science',
        link: 'https://towardsdatascience.com/latest',
        image: feed.image?.url,
        item: feed.items
            .map((item) => ({
                title: item.title ?? '',
                link: item.link,
                guid: item.guid ?? item.id,
                description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
                author: item.creator ?? item.author,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                category: item.categories,
            }))
            .filter((item) => item.title),
    };
}
