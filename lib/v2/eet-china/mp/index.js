const { rootUrl, ProcessItems } = require('./util');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`mp${category ? `/c${category}` : ''}`, rootUrl).href;

    ctx.state.data = await ProcessItems(limit, currentUrl, ctx.cache.tryGet);
};
