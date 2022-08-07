const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = rootUrl;
    const apiUrl = `${rootUrl}/api/topic/node/topics?page=1&type=7`;

    const items = await ProcessItems(apiUrl, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: '海角社区 - 原创',
        link: currentUrl,
        item: items,
    };
};
