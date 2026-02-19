import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const apiBase = 'https://phx.unusualwhales.com';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/unusualwhales/news',
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
            source: ['unusualwhales.com/news', 'unusualwhales.com/'],
        },
    ],
    name: 'News Feed',
    maintainers: ['TonyRL'],
    handler,
    url: 'unusualwhales.com/news',
};

async function handler() {
    const response = await ofetch(`${apiBase}/api/news/headlines-feed?limit=100`);

    const items = response.data.map((item) => ({
        title: item.headline,
        link: item.url,
        guid: item.id,
        author: item.source,
        pubDate: parseDate(item.created_at),
        category: item.tickers,
    }));

    return {
        title: 'Market Data - News',
        description: 'Explore unusual options, options flow, dark pools, short activity, and stock activity on unusualwhales.com. Unusual whales has a full news service available!',
        link: 'https://unusualwhales.com/news-feed',
        image: 'https://unusualwhales.com/android-icon-192x192.png',
        language: 'en-US',
        item: items,
    };
}
