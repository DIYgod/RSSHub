import type { Route } from '@/types';

import fetchFeed from './utils';

export const route: Route = {
    path: '/category/:category?',
    categories: ['new-media'],
    example: '/ruancan/category/news',
    parameters: { category: '分类 id，可在对应分类页 URL 中找到，默认为业界' },
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
            source: ['ruancan.com/cat/:category', 'ruancan.com/'],
            target: '/category/:category',
        },
    ],
    name: '分类',
    maintainers: [],
    handler,
    url: 'ruancan.com/',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const currentUrl = `/cat/${category}`;

    return await fetchFeed(ctx, currentUrl);
}
