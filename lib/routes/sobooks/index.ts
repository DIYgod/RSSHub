import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/:category?',
    categories: ['government'],
    example: '/sobooks',
    parameters: { category: '分类, 见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['sobooks.net/:category'],
        target: '/:category',
    },
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    ctx.set('data', await utils(ctx, category));
}
