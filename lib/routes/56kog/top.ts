import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, fetchItems } from './util';

export const route: Route = {
    path: '/top/:category?',
    categories: ['reading'],
    example: '/56kog/top/weekvisit',
    parameters: { category: '分类，见下表，默认为周点击榜' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '榜单',
    maintainers: ['nczitzk'],
    handler,
    description: `| [周点击榜](https://www.56kog.com/top/weekvisit.html) | [总收藏榜](https://www.56kog.com/top/goodnum.html) | [最新 入库](https://www.56kog.com/top/postdate.html) |
  | ---------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
  | weekvisit                                            | goodnum                                            | postdate                                             |`,
};

async function handler(ctx) {
    const { category = 'weekvisit' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`top/${category.split(/_/)[0]}_1.html`, rootUrl).href;

    return await fetchItems(limit, currentUrl, cache.tryGet);
}
