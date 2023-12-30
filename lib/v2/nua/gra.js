const util = require('./utils');
const baseUrl = 'https://grad.nua.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.list_item';
    const artiContent = '.read';
    const listDate = '.Article_PublishDate';
    const webPageName = '.col_title';

    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent, ctx);

    ctx.state.data = {
        title: 'NUA-研究生处-' + items[1],
        link: `${baseUrl}/${type}/list.htm`,
        description: '南京艺术学院 研究生处 ' + items[1],
        item: results,
    };
};
