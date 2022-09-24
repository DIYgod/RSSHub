// const got = require('@/utils/got');
// const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const baseUrl = 'https://dc.nua.edu.cn';

    let listName;
    let listDate;
    let artiContent;
    let webPageName;

    switch (type) {
        case 'news':
            listName = 'li.pre35.left li.news_list';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre35.left .big_title';
            break;
        case 'teach':
            listName = 'li.pre65.right li.effects';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre65.right .big_title';
            break;
        case 'project':
            listName = 'ul.center div.center_list_img';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'ul.center .big_title';
            break;
        case 'party':
            listName = 'div.pre35.right li.party_list';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'div.pre35.right .big_title';
            break;
        default:
            throw Error(`暂不支持对${type}的订阅`);
    }

    const items = await util.ProcessList(baseUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent, ctx.cache);

    ctx.state.data = {
        title: 'NUA-设计学院-' + items[1],
        link: baseUrl,
        description: '南京艺术学院 设计学院 ' + items[1],
        item: results,
    };
};
