const got = require('@/utils/got');

const { rootUrl, getData, processItems } = require('./util');

module.exports = async (ctx) => {
    const { category = 'all' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 60;

    const apiRankUrl = new URL(`api/xpc/v2/rank/${category}`, rootUrl).href;

    const { data: apiResponse } = await got(apiRankUrl);

    const current = apiResponse.data.list[0];
    const currentUrl = current.web_link;
    const currentName = `${current.code}-${current.year}-${current.index}`;

    const { data, response: currentResponse } = await getData(currentUrl, ctx.cache.tryGet);

    const buildId = currentResponse.match(/\/static\/(\w+)\/_buildManifest\.js/)[1];

    const apiUrl = new URL(`_next/data/${buildId}/rank/article/${currentName}.json`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    let items = response.pageProps.rankList;

    items = await processItems(items.slice(0, limit), ctx.cache.tryGet);

    ctx.state.data = {
        ...data,
        item: items,
    };
};
