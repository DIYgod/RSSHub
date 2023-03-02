const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const apiUrl = `${rootUrl}/api/ajax/getlistbycid?cid=48&type=1&page=1&pagesize=${ctx.query.limit ?? 30}`;

    const items = await ProcessItems(apiUrl, ctx.cache.tryGet);

    ctx.state.data = {
        title: '第一财经 - 头条',
        link: rootUrl,
        item: items,
    };
};
