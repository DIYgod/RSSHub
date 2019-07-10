const utils = require('./utils');

module.exports = async (ctx) => {
    const link = 'https://m.thepaper.cn/';
    const items = await utils.ProcessFeed(link, ctx);

    ctx.state.data = {
        title: '澎湃新闻 - 首页头条',
        link,
        item: items,
    };
};
