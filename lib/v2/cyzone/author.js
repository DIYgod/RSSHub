const { rootUrl, apiRootUrl, processItems, getInfo } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const apiUrl = new URL('v2/author/author/detail', apiRootUrl).href;
    const currentUrl = new URL(`author/${id}`, rootUrl).href;

    const items = await processItems(apiUrl, limit, ctx.cache.tryGet, {
        author_id: id,
    });

    ctx.set('data', {
        item: items,
        ...(await getInfo(currentUrl, ctx.cache.tryGet)),
    });
};
