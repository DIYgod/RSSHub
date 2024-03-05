// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { apiBriefRootUrl, processItems, fetchBriefColumnData } = require('./util');

export default async (ctx) => {
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

    ctx.set('data', {
        item: items,
        ...data,
    });
};
