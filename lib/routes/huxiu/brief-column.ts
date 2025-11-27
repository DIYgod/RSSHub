import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiBriefRootUrl, fetchBriefColumnData, processItems } from './util';

export const route: Route = {
    path: '/briefcolumn/:id',
    categories: ['new-media'],
    example: '/huxiu/briefcolumn/1',
    parameters: { id: '简报 id，可在对应简报页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '简报',
    maintainers: ['Fatpandac', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('briefColumn/getContentListByCategoryId', apiBriefRootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            brief_column_id: id,
            pagesize: limit,
        },
    });

    ctx.set('json', response.data.datalist);

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchBriefColumnData(id);

    return {
        item: items,
        ...data,
    };
}
