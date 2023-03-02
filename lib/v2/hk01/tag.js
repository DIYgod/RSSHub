const got = require('@/utils/got');
const { rootUrl, apiRootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '1';

    const currentUrl = `${rootUrl}/tag/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/tag/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: `${id} | 香港01`,
        link: currentUrl,
        item: items,
    };
};
