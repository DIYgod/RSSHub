const got = require('@/utils/got');

const { rootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const apiUrl = new URL('v2_action/tag_article_list', rootUrl).href;
    const currentUrl = new URL(`tags/${id}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            tag_id: id,
        },
    });

    const items = await processItems(response.data, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
