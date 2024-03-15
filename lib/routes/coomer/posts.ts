import { Route } from '@/types';
import fetchItems from './utils';

export const route: Route = {
    path: '/posts',
    categories: ['multimedia'],
    example: '/coomer/posts',
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
            source: ['coomer.party/posts', 'coomer.party/'],
        },
    ],
    name: 'Recent Posts',
    maintainers: ['nczitzk'],
    handler,
    url: 'coomer.party/posts',
};

async function handler(ctx) {
    const currentUrl = 'posts';

    return await fetchItems(ctx, currentUrl);
}
