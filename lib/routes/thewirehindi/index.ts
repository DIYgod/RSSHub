import type { Data, Route } from '@/types';
import parser from '@/utils/rss-parser';

import { mapFeedItem } from './utils';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/thewirehindi',
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
            source: ['thewirehindi.com/'],
        },
    ],
    name: 'Latest News',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'thewirehindi.com/',
};

async function handler(): Promise<Data> {
    const feed = await parser.parseURL('https://thewirehindi.com/feed/');
    const items = feed.items.map((item) => mapFeedItem(item)).filter((item) => item.title);

    return {
        title: 'The Wire Hindi - Latest News',
        link: 'https://thewirehindi.com/',
        item: items,
        description: 'Latest news from The Wire Hindi',
        logo: 'https://thewirehindi.com/wp-content/uploads/2023/05/cropped-The-wire-32x32.jpeg',
        language: 'hi',
    };
}
