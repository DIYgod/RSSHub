const util = require('./utils');
// const baseUrl = 'https://www.nua.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type;

    if (type == 346 || 332) {
        baseUrl = 'https://www.nua.edu.cn';
        newsUrl = `${baseUrl}/${type}/list.htm`;
        listName = 'li.news';
        webPageName = '.col_title';
    } else {
        baseUrl = 'https://sxw.nua.edu.cn';
        newsUrl = `${baseUrl}/${type}/list.htm`;
        listName = 'li.list_item';
        webPageName = '.Column_Anchor';
    }

    const items = await util.ProcessList(newsUrl, baseUrl, listName);
    const pageName = await util.ProcessPageName(newsUrl, webPageName);
    const results = await util.ProcessFeed(items, ctx.cache);

    ctx.state.data = {
        title: 'NUA-' + pageName,
        link: newsUrl,
        description: '南京艺术学院 ' + pageName,
        item: results,
    };
};