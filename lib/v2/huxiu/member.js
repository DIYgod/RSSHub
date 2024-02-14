const got = require('@/utils/got');

const { rootUrl, apiMemberRootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { id, type = 'article' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 10;

    const apiUrl = new URL(`web/${type}/${type}List`, apiMemberRootUrl).href;
    const currentUrl = new URL(`member/${id}${type === 'article' ? '' : `/${type}`}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            uid: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
