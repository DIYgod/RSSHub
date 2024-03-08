import { Route } from '@/types';
import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/items/all/:order?',
    categories: ['program-update'],
    example: '/hpoi/items/all',
    parameters: { order: '排序, 见下表，默认为 add' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.hpoi.net/hobby/all'],
        target: '/items/all',
    },
    name: '所有周边',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    ctx.set('data', await ProcessFeed('all', 0, ctx.req.param('order')));
}
