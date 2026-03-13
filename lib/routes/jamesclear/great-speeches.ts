import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchContent, processItem, rootUrl } from './utils';

export const route: Route = {
    path: '/great-speeches',
    view: ViewType.Articles,
    categories: ['blog'],
    example: '/jamesclear/great-speeches',
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
            source: ['jamesclear.com/great-speeches'],
            target: '/great-speeches',
        },
    ],
    name: 'Great Speeches',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const speeches = await fetchContent('great-speeches');
    const items = speeches.map((item) => processItem(item));

    return {
        title: 'James Clear - Great Speeches',
        description: 'Collection of great speeches curated by James Clear',
        link: `${rootUrl}/great-speeches`,
        item: items,
        language: 'en',
        icon: `${rootUrl}/favicon.ico`,
    };
}
