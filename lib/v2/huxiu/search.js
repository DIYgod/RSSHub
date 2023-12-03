const got = require('@/utils/got');

const { rootUrl, apiSearchRootUrl, generateSignature, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const apiUrl = new URL('api/article', apiSearchRootUrl).href;
    const currentUrl = rootUrl;

    const { data: response } = await got.post(apiUrl, {
        searchParams: {
            platform: 'www',
            s: keyword,
            sort: '',
            page: 1,
            pagesize: limit,
            appid: 'hx_search_202303',
            ...generateSignature(),
        },
    });

    const items = await processItems(response.data.datalist, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);
    data.title = `${keyword}-搜索结果-${data.title}`;

    ctx.state.json = response.data.datalist;

    ctx.state.data = {
        item: items,
        ...data,
    };
};
