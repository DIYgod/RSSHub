const got = require('@/utils/got');

const { rootUrl, apiArticleRootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const apiUrl = new URL('web/collection/articleList', apiArticleRootUrl).href;
    const currentUrl = new URL(`collection/${id}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            collection_id: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
