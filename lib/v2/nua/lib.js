const util = require('./utils');
const baseUrl = 'https://lib.nua.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let webPageName;

    switch (type) {
        case 'xwdt':
            webPageName = '.wp_column.column-1.selected';
            break;
        case 'djdt':
            webPageName = '.wp_column.column-2.selected';
            break;
        case 'zydt':
            webPageName = '.wp_column.column-3.selected';
            break;
        case 'fwdt':
            webPageName = '.wp_column.column-4.selected';
            break;
        default:
            throw Error(`暂不支持对${type}的订阅`);
    }

    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'div.news_con';
    const artiContent = '.wp_articlecontent';
    const listDate = '.news_date';

    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent, ctx);

    ctx.state.data = {
        title: 'NUA-图书馆-' + items[1],
        link: `${baseUrl}/${type}/list.htm`,
        description: '南京艺术学院 图书馆 ' + items[1],
        item: results,
    };
};
