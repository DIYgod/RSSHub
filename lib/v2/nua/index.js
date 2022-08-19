const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    if (type == '346' || '332' || '347') {
        baseUrl = 'https://www.nua.edu.cn';
        newsUrl = `${baseUrl}/${type}/list.htm`;
        listName = 'li.news';
        listDate = '.news_meta';
        webPageName = '.col_title';
    } 
    if (type == '230' || '232' || '233' || '234' || '236' || '237') {
        baseUrl = 'https://sxw.nua.edu.cn';
        newsUrl = `${baseUrl}/${type}/list.htm`;
        listName = 'li.list_item';
        listDate = '.Article_PublishDate';
        webPageName = '.Column_Anchor';
    } 
    if (type == '231') {
        baseUrl = 'https://www.nua.edu.cn/_s4';
        newsUrl = `${baseUrl}/${type}/list.psp`;
        listName = 'li.list_item';
        listDate = '.Article_PublishDate';
        webPageName = '.Column_Anchor';
    }
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