import type { Route } from '@/types';
import cache from '@/utils/cache';

import { apiRootUrl, getInfo, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/label/:name',
    categories: ['new-media'],
    example: '/cyzone/label/创业邦周报',
    parameters: { name: '标签名称，可在对应标签页 URL 中找到' },
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
            source: ['cyzone.cn/label/:name', 'cyzone.cn/'],
        },
    ],
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const apiUrl = new URL('v2/content/tag/tagList', apiRootUrl).href;
    const currentUrl = new URL(`label/${name}`, rootUrl).href;

    const items = await processItems(apiUrl, limit, cache.tryGet, {
        tag: name,
    });

    return {
        item: items,
        ...(await getInfo(currentUrl, cache.tryGet)),
    };
}
