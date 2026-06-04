import type { Data, Route } from '@/types';

import { baseUrl, fetchArticles } from './utils';

export const route: Route = {
    path: '/insights',
    example: '/capitalmind/insights',
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
            source: ['capitalmind.in/insights'],
            target: '/insights',
        },
    ],
    name: 'Insights',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const items = await fetchArticles('insights');

    return {
        title: 'Capitalmind Insights',
        link: `${baseUrl}/insights`,
        description: 'Financial insights and analysis from Capitalmind',
        language: 'en',
        item: items,
        allowEmpty: false,
        image: `${baseUrl}/favicons/favicon.ico`,
        icon: `${baseUrl}/favicons/favicon.ico`,
        logo: `${baseUrl}/favicons/favicon.ico`,
    } as Data;
}
