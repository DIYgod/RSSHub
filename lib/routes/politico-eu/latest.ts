import type { Route } from '@/types';

import parser from '@/utils/rss-parser';

const feedUrl = 'https://www.politico.eu/feed/';
const link = 'https://www.politico.eu/latest/';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media'],
    example: '/politico-eu/latest',
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
            source: ['politico.eu/latest/', 'politico.eu/'],
            target: '/politico-eu/latest',
        },
    ],
    name: 'Latest',
    maintainers: ['maxlixiang'],
    handler,
};

async function handler() {
    const feed = await parser.parseURL(feedUrl);

    return {
        title: feed.title ?? 'POLITICO Europe - Latest',
        link,
        description: feed.description ?? 'Latest news from POLITICO Europe.',
        item: feed.items,
    };
}
