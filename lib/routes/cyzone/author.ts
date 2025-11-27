import type { Route } from '@/types';
import cache from '@/utils/cache';

import { apiRootUrl, getInfo, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/author/:id',
    categories: ['new-media'],
    example: '/cyzone/author/1225562',
    parameters: { id: '作者 id，可在对应作者页 URL 中找到' },
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
            source: ['cyzone.cn/author/:id', 'cyzone.cn/'],
        },
    ],
    name: '作者',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const apiUrl = new URL('v2/author/author/detail', apiRootUrl).href;
    const currentUrl = new URL(`author/${id}`, rootUrl).href;

    const items = await processItems(apiUrl, limit, cache.tryGet, {
        author_id: id,
    });

    return {
        item: items,
        ...(await getInfo(currentUrl, cache.tryGet)),
    };
}
