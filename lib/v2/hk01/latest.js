const got = require('@/utils/got');
const { rootUrl, apiRootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/latest`;
    const apiUrl = `${apiRootUrl}/v2/page/latest`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: '即時 | 香港01',
        link: currentUrl,
        item: items,
    };
};
