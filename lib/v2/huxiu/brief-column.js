import got from '@/utils/got';

const { apiBriefRootUrl, processItems, fetchBriefColumnData } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('briefColumn/getContentListByCategoryId', apiBriefRootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            brief_column_id: id,
            pagesize: limit,
        },
    });

    ctx.state.json = response.data.datalist;

    const items = await processItems(response.data.datalist, limit, ctx.cache.tryGet);

    const data = await fetchBriefColumnData(id);

    ctx.set('data', {
        item: items,
        ...data,
    });
};
