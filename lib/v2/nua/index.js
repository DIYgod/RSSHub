const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const baseUrl = 'https://www.nua.edu.cn';
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.news';
    const listDate = '.news_meta';
    const webPageName = '.col_title';

    const artiContent = '.read';
    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate);
    const pageName = await util.ProcessPageName(newsUrl, webPageName);
    const results = await util.ProcessFeed(items, artiContent, ctx.cache);

    ctx.state.data = {
        title: 'NUA-' + pageName,
        link: newsUrl,
        description: '南京艺术学院 ' + pageName,
        item: results,
    };
};