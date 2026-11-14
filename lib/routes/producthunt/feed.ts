import type { Data, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/feed',
    categories: ['other'],
    example: '/producthunt/feed',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Official Feed',
    maintainers: ['miaoyafeng', 'Fatpandac'],
    handler,
    url: 'www.producthunt.com/feed/',
};

async function handler(): Promise<Data> {
    const feed = await parser.parseURL('https://www.producthunt.com/feed/');

    return {
        title: feed.title ?? 'Product Hunt',
        link: 'https://www.producthunt.com/',
        description: feed.description,
        language: 'en',
        image: feed.image?.url,
        item: feed.items
            .map((item) => ({
                title: item.title ?? '',
                link: item.link,
                guid: item.guid ?? item.id,
                description: item.content ?? item.contentSnippet,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                author: item.author ?? item.creator,
                category: item.categories,
            }))
            .filter((item) => item.title),
    };
}
