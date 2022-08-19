// const got = require('@/utils/got');
// const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    baseUrl = 'https://dc.nua.edu.cn';

    if (type == 'news') {
        listName = 'li.pre35.left li.news_list';
        listDate = '.date';
        artiContent = '.article';
        webPageName = 'li.pre35.left .big_title';
    } else if (type == 'teach') {
        listName = 'li.pre65.right li.effects';
        listDate = '.date';
        artiContent = '.article';
        webPageName = 'li.pre65.right .big_title';
    } else if (type == 'project') {
        listName = 'ul.center div.center_list_img';
        listDate = '.date';
        artiContent = '.article';
        webPageName = 'ul.center .big_title';
    } else if (type == 'rc') {
        listName = 'div.pre65.left li';
        listDate = '.date';
        artiContent = '.article';
        webPageName = 'div.pre65.left .big_title';
    } else if (type == 'party') {
        listName = 'div.pre35.right li.party_list';
        listDate = '.date';
        artiContent = '.article';
        webPageName = 'div.pre35.right .big_title';
    } else if (type == 'youth') {
        listName = 'div.is-inview li';
        listDate = '.date';
        artiContent = '.article';
        webPageName = 'div.is-inview .big_title';
    }

    const newsUrl = baseUrl;
    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate);
    const pageName = await util.ProcessPageName(newsUrl, webPageName);
    const results = await util.ProcessFeed(items, artiContent, ctx.cache);

    ctx.state.data = {
        title: 'NUA-设计学院-' + pageName,
        link: newsUrl,
        description: '南京艺术学院 设计学院 ' + pageName,
        item: results,
    };
};