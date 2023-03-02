const got = require('@/utils/got');
const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const node = ctx.params.node ?? '258';
    const type = ctx.params.type ?? '1';

    const currentUrl = rootUrl;
    const nodeUrl = `${rootUrl}/api/topic/node?nodeId=${node}`;
    const apiUrl = `${rootUrl}/api/topic/node/topics?page=1&nodeId=${node}&type=${type}&limit=${ctx.query.limit}`;

    const response = await got({
        method: 'get',
        url: nodeUrl,
    });

    const data = response.data.data;

    const items = await ProcessItems(apiUrl, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: `海角社区 - ${data.name}`,
        link: `${currentUrl}/article?nodeId=${node}`,
        item: items,
        description: data.description.replace(/<\/?p>/, ''),
    };
};
