import { Data, Route, ViewType } from '@/types';
import { rootUrl, fetchContent, processItem } from './utils';

export const route: Route = {
    path: '/quotes',
    view: ViewType.Articles,
    categories: ['blog'],
    example: '/jamesclear/quotes',
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
            source: ['jamesclear.com/quotes'],
            target: '/quotes',
        },
    ],
    name: 'Quotes',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const quotes = await fetchContent('quotes');
    const items = quotes.map((item) => processItem(item));

    return {
        title: 'James Clear - Quotes',
        description: 'Quotes from James Clear',
        link: `${rootUrl}/quotes`,
        item: items,
        language: 'en',
        icon: `${rootUrl}/favicon.ico`,
    };
}
