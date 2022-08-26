const got = require('@/utils/got');
const { rootUrl, apiRootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '1';

    const currentUrl = `${rootUrl}/channel/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/category/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: `${response.data.category.publishName} | 香港01`,
        link: currentUrl,
        item: items,
        image: response.data.category.icon,
    };
};
