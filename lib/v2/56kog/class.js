const { rootUrl, fetchItems } = require('./util');

module.exports = async (ctx) => {
    const { category = '1_1' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`class/${category}.html`, rootUrl).href;

    ctx.state.data = await fetchItems(limit, currentUrl, ctx.cache.tryGet);
};
