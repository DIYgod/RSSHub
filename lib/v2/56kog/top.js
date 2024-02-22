const { rootUrl, fetchItems } = require('./util');

module.exports = async (ctx) => {
    const { category = 'weekvisit' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`top/${category.split(/_/)[0]}_1.html`, rootUrl).href;

    ctx.state.data = await fetchItems(limit, currentUrl, ctx.cache.tryGet);
};
