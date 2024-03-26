import { Route } from '@/types';
import { rootUrl, getList, getItems } from './utils';

export const route: Route = {
    path: '/book',
    categories: ['journal'],
    example: '/caareviews/book',
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
            source: ['caareviews.org/reviews/book'],
        },
    ],
    name: 'Book Reviews',
    maintainers: ['Fatpandac'],
    handler,
    url: 'caareviews.org/reviews/book',
};

async function handler(ctx) {
    const url = `${rootUrl}/reviews/book`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    return {
        title: 'Book Reviews',
        link: url,
        item: items,
    };
}
