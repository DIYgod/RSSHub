// @ts-nocheck
const util = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type');

    const baseUrl = 'https://www.nua.edu.cn';
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.news';
    const listDate = '.news_meta';
    const webPageName = '.col_title';

    const artiContent = '.read';
    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent);

    ctx.set('data', {
        title: 'NUA-' + items[1],
        link: newsUrl,
        description: '南京艺术学院 ' + items[1],
        item: results,
    });
};
