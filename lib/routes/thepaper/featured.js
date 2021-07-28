const utils = require('./utils');

module.exports = async (ctx) => {
    const rootUrl = 'https://m.thepaper.cn';

    const link = `${rootUrl}/list_page.jsp?&nodeid=25949&isList=1&pageidx=1`;
    const items = await utils.ProcessFeed('.list_item_infor', link, ctx);

    ctx.state.data = {
        title: '澎湃新闻 - 首页头条',
        link: `${rootUrl}/channel_25949`,
        item: items,
    };
};
