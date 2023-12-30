const got = require('@/utils/got');
const { rootUrl, apiRootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '649';

    const currentUrl = `${rootUrl}/issue/${id}`;
    const apiUrl = `${apiRootUrl}/v2/issues/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.blocks[0].articles, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: `${response.data.title} | 香港01`,
        link: currentUrl,
        item: items,
    };
};
