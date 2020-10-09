const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const rootUrl = 'https://m.thepaper.cn';

    const link = `${rootUrl}/list_page.jsp?nodeid=${id}&isList=1&pageidx=1`;
    const items = await utils.ProcessFeed('.list_item_infor', link, ctx);

    ctx.state.data = {
        title: `澎湃新闻列表 - ${id}`,
        link: `${rootUrl}/list_${id}`,
        item: items,
    };
};
