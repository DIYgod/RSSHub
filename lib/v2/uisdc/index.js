const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const baseUrl = 'https://www.uisdc.com';

    let listName;
    let listDate;
    let artiContent;
    let webPageName;

    switch (type) {
        case 'latest':
            listName = 'div.home-list.archive-list div.item.list-item.item-article';
            listDate = 'span.meta-time.meta-time';
            artiContent = '.article';
            webPageName = '最新';
            break;
        case 'hot':
            listName = 'div.home-list.archive-list.picHD div.item.list-item.item-article';
            listDate = 'span.meta-time.meta-time';
            artiContent = '.article';
            webPageName = '热门';
            break;
        default:
            throw Error(`暂不支持对${type}的订阅`);
    }

    const items = await util.ProcessList(baseUrl, listName, webPageName);
    const results = await util.ProcessFeed(items, listDate, artiContent, ctx);

    ctx.state.data = {
        title: '优设网 - ' + webPageName,
        link: baseUrl,
        description: '优设网 ' + webPageName,
        item: results,
    };
};
