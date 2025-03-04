import { Route, Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { parseItem } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/coindesk/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['coindesk.com/'],
            target: '/news',
        },
    ],
    description: 'Get latest news from CoinDesk with full text.',
};

async function handler(): Promise<Data> {
    const rssUrl = 'https://feeds.feedburner.com/Coindesk';
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(feed.items.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    // Filter out null items
    const validItems = items.filter((item): item is DataItem => item !== null);

    return {
        title: feed.title || 'CoinDesk News',
        link: feed.link || 'https://coindesk.com',
        description: feed.description || 'Latest news from CoinDesk',
        language: feed.language || 'en',
        item: validItems,
    };
}
