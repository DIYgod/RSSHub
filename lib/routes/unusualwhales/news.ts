import { Route } from '@/types';
import got from '@/utils/got';
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
    name: 'News Flow',
    maintainers: ['TonyRL'],
    handler,
    url: 'unusualwhales.com/news',
};

async function handler() {
    const { data } = await got(`${apiBase}/api/fj_articles`);

    const items = data.map((item) => ({
        title: item.title,
        description: item.description,
        link: item.url,
        pubDate: parseDate(item.publish_date),
    }));

    return {
        title: 'Flow - News',
        description: 'Explore unusual options, options flow, dark pools, short activity, and stock activity on unusualwhales.com. Unusual whales has a full news service available!',
        link: 'https://unusualwhales.com/news-feed',
        image: 'https://unusualwhales.com/android-icon-192x192.png',
        language: 'en-US',
        item: items,
    };
}
