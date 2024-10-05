import { Route } from '@/types';
import { rootUrl, getList, getItems } from './utils';

export const route: Route = {
    path: '/exhibition',
    categories: ['journal'],
    example: '/caareviews/exhibition',
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
            source: ['caareviews.org/reviews/exhibition'],
        },
    ],
    name: 'Exhibition Reviews',
    maintainers: ['Fatpandac'],
    handler,
    url: 'caareviews.org/reviews/exhibition',
};

async function handler(ctx) {
    const url = `${rootUrl}/reviews/exhibition`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    return {
        title: 'Exhibition Reviews',
        link: url,
        item: items,
    };
}
