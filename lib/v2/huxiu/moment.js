const got = require('@/utils/got');

const { rootUrl, apiMomentRootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const apiUrl = new URL('web-v2/moment/feed', apiMomentRootUrl).href;
    const currentUrl = new URL('moment', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
        },
    });

    const items = await processItems(response.data.moment_list.datalist[0].datalist, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
