const got = require('@/utils/got');

const { apiBriefRootUrl, processItems, fetchClubData } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const apiUrl = new URL('club/briefList', apiBriefRootUrl).href;

    const { data, briefColumnId } = await fetchClubData(id);

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            club_id: id,
            brief_column_id: briefColumnId,
            pagesize: limit,
        },
    });

    ctx.state.json = response.data.datalist;

    const items = await processItems(response.data.datalist, limit, ctx.cache.tryGet);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
