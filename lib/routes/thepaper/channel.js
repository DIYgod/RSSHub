const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://m.thepaper.cn/channel_${id}`;
    const items = await utils.ProcessFeed(link, ctx);

    ctx.state.data = {
        title: `澎湃新闻频道 - ${id}`,
        link,
        item: items,
    };
};
