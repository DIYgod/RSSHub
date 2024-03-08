import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, fetchItems } from './util';

export const route: Route = {
    path: '/class/:category?',
    categories: ['government'],
    example: '/56kog/class/1_1',
    parameters: { category: '分类，见下表，默认为玄幻魔法' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { category = '1_1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`class/${category}.html`, rootUrl).href;

    ctx.set('data', await fetchItems(limit, currentUrl, cache.tryGet));
}
