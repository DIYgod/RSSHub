const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const baseUrl = 'https://sxw.nua.edu.cn';
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.list_item';
    const listDate = '.Article_PublishDate';
    const webPageName = '.Column_Anchor';

    const artiContent = '.read';
    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent, ctx.cache);

    ctx.state.data = {
        title: 'NUA-双馨网-' + items[1],
        link: newsUrl,
        description: '南京艺术学院 双馨网 ' + items[1],
        item: results,
    };
};
