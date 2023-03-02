const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = rootUrl;
    const apiUrl = `${rootUrl}/api/topic/node/news?page=1`;

    const items = await ProcessItems(apiUrl, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: '海角社区 - 新闻',
        link: currentUrl,
        item: items,
    };
};
