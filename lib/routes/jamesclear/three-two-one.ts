import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchContent, processItem, rootUrl } from './utils';

export const route: Route = {
    path: '/3-2-1',
    view: ViewType.Articles,
    categories: ['blog'],
    example: '/jamesclear/3-2-1',
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
            source: ['jamesclear.com/3-2-1'],
            target: '/3-2-1',
        },
    ],
    name: '3-2-1 Newsletter',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const newsletters = await fetchContent('3-2-1');
    const items = newsletters.map((item) => processItem(item));

    return {
        title: 'James Clear - 3-2-1 Newsletter',
        description: '3 ideas, 2 quotes, and 1 question to consider each week',
        link: `${rootUrl}/3-2-1`,
        item: items,
        language: 'en',
        image: `${rootUrl}/wp-content/uploads/2021/04/3-2-1-Featured-Image.png`,
        icon: `${rootUrl}/favicon.ico`,
    };
}
