import { Route } from '@/types';
import fetchItems from './utils';

export const route: Route = {
    path: '/posts',
    categories: ['picture'],
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
    radar: {
        source: ['coomer.party/posts', 'coomer.party/'],
    },
    name: 'Recent Posts',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const currentUrl = 'posts';

    ctx.set('data', await fetchItems(ctx, currentUrl));
}
