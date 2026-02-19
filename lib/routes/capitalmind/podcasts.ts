import type { Data, Route } from '@/types';

import { baseUrl, fetchArticles } from './utils';

export const route: Route = {
    path: '/podcasts',
    example: '/capitalmind/podcasts',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['capitalmind.in/podcasts'],
            target: '/podcasts',
        },
    ],
    name: 'Podcasts',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const items = await fetchArticles('podcasts');

    return {
        title: 'Capitalmind Podcasts',
        link: `${baseUrl}/podcasts`,
        description: 'Podcasts from Capitalmind on investing and finance',
        language: 'en',
        item: items,
        allowEmpty: false,
        itunes_author: 'Capitalmind',
        image: `${baseUrl}/favicons/apple-touch-icon.png`,
        icon: `${baseUrl}/favicons/favicon.ico`,
        logo: `${baseUrl}/favicons/favicon.ico`,
    } as Data;
}
