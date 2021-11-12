const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const rootUrl = 'https://m.thepaper.cn';

    const link = id === '26916' ? `${rootUrl}/channel_26916` : `${rootUrl}/list_page.jsp?nodeid=${id}&isList=0&pageidx=1`;
    const items = await utils.ProcessFeed(id === '26916' ? '.list_video_item' : '.list_item_infor', link, ctx);

    ctx.state.data = {
        title: `澎湃新闻频道 - ${id}`,
        link: `${rootUrl}/channel_${id}`,
        item: items,
    };
};
