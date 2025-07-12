import { Data, Route, ViewType } from '@/types';
import { rootUrl, fetchContent, processItem } from './utils';

export const route: Route = {
    path: '/book-summaries',
    view: ViewType.Articles,
    categories: ['blog'],
    example: '/jamesclear/book-summaries',
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
            source: ['jamesclear.com/book-summaries'],
            target: '/book-summaries',
        },
    ],
    name: 'Book Summaries',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const summaries = await fetchContent('book-summaries');
    const items = summaries.map((item) => processItem(item));

    return {
        title: 'James Clear - Book Summaries',
        description: 'Book summaries by James Clear',
        link: `${rootUrl}/book-summaries`,
        item: items,
        language: 'en',
        icon: `${rootUrl}/favicon.ico`,
    };
}
