const { rootUrl, apiRootUrl, processItems, getInfo } = require('./util');

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 5;

    const apiUrl = new URL('v2/content/tag/tagList', apiRootUrl).href;
    const currentUrl = new URL(`label/${name}`, rootUrl).href;

    const items = await processItems(apiUrl, limit, ctx.cache.tryGet, {
        tag: name,
    });

    ctx.state.data = {
        ...{
            item: items,
        },
        ...(await getInfo(currentUrl, ctx.cache.tryGet)),
    };
};
