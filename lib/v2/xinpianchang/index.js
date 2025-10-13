const { rootUrl, getData, processItems } = require('./util');

module.exports = async (ctx) => {
    const { params = 'article-0-0-all-all-0-0-score' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 60;

    const currentUrl = new URL(`discover/${params}`, rootUrl).href;

    const { data, response } = await getData(currentUrl, ctx.cache.tryGet);

    let items = JSON.parse(response.match(/"list":(\[.*?\]),"total"/)[1]);

    items = await processItems(items.slice(0, limit), ctx.cache.tryGet);

    ctx.state.data = {
        ...data,
        item: items,
    };
};
