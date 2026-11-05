import type { Route } from '@/types';

export const route: Route = {
    path: '/:store',
    categories: ['shopping'],
    example: '/shopback/shopee-mart',
    parameters: { store: 'Store, can be found in URL' },
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
            source: ['shopback.com.tw/:category', 'shopback.com.tw/'],
        },
    ],
    name: 'Store',
    maintainers: ['nczitzk'],
    handler,
};

function handler(ctx) {
    const store = ctx.req.param('store');
    return ctx.set('redirect', `/shopback/cashback/${store}${new URL(ctx.req.url).search}`);
}
