// const got = require('@/utils/got');
// const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    baseUrl = 'https://dc.nua.edu.cn';

    switch (type) {
        case 'news':
            listName = 'li.pre35.left li.news_list';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre35.left .big_title';
        case 'teach':
            listName = 'li.pre65.right li.effects';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre65.right .big_title';
        case 'project':
            listName = 'ul.center div.center_list_img';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'ul.center .big_title';
        case 'rc':
            listName = 'li.pre65.left li';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre65.left .big_title';
        case 'party':
            listName = 'li.pre35.right li.party_list';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre35.right .big_title';
        case 'youth':
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
        title: 'NUA-' + pageName,
        link: newsUrl,
        description: '南京艺术学院 ' + pageName,
        item: results,
    };
};