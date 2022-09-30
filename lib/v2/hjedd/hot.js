const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = rootUrl;
    const apiUrl = `${rootUrl}/api/topic/hot/topics?page=1`;

    const items = await ProcessItems(apiUrl, ctx.query.limit, ctx.cache.tryGet);

    ctx.state.data = {
        title: '海角社区 - 热门',
        link: currentUrl,
        item: items,
    };
};
