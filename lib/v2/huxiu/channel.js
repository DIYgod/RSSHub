const got = require('@/utils/got');

const { rootUrl, apiArticleRootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 20;

    const apiUrl = new URL(`web/${id ? 'channel' : 'article'}/articleList`, apiArticleRootUrl).href;
    const currentUrl = new URL(id ? `channel/${id}.html` : 'article', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            channel_id: id,
            pagesize: limit,
        },
    });

    const items = await processItems(response.data?.dataList ?? response.data.datalist, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
