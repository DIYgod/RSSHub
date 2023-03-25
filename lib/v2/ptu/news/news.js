const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const utils = require('../utils');

const baseUrl = 'https://news.ptu.edu.cn/';


const getArticleList = async (ctx, url, pageId, pageSize = null) => {
    let response, pageTitle;
    if (pageSize === null) {
        // get pageSize
        response = await got({method: 'get', url}, { https: { rejectUnauthorized: false } });
        const {pageTitle: _1, pageSize: _2} = utils.getPageInfo(response.data);
        pageTitle  = _1;
        pageSize = _2;
    }
    const pageUrl = utils.getPageUrl(url, pageId, pageSize);
    if (pageUrl !== url) {
        // go to target url
        response = await got({method: 'get', url: pageUrl}, { https: { rejectUnauthorized: false } });
    }

    const $ = cheerio.load(response.data);
    const list = $('li.clearfix');
    return Promise.all(list.map(async (_, item) => {
        item = $(item);

        const title = item.find('a').first().text();
        const articleUrl = item.find('a').attr('href').startsWith('../') ? new URL(item.find('a').attr('href'), baseUrl).href : baseUrl + item.find('a').attr('href');
        const { author, article } = await utils.getArticleContent(ctx, articleUrl, 1);

        const day = item.find("div.fl.time").find("p").first().text().trim();
        const year_month = item.find("div.fl.time").find("p").last().text().trim();
        const pubDate = timezone(parseDate(year_month + "." + day, "YYYY.MM.DD", true), +8);
        // console.log(pageTitle)
        return {
                title,
                author,
                description: article,
                link: articleUrl,
                pubDate,
                // extra info
                pageTitle,
                pageSize,
        };
    }).get());
};

module.exports = async (ctx) => {
    const { type, pageId } = ctx.params;
    const path = type ? type : "pyyw";
    const url = `https://news.ptu.edu.cn/${path}.htm`;

    let items = await getArticleList(ctx, url, pageId);
    const pageInfo = await items[0];
    const title = `${pageInfo.pageTitle} - 莆田学院新闻网`;
    const pageSize = pageInfo.pageSize;


    if (pageId === 'all') {
        const pagePromises = [];
        for (let i = 2; i <= pageSize; i++) {
            pagePromises.push(getArticleList(ctx, url, i, pageSize));
        }
        const pagesItems = await Promise.all(pagePromises);
        items = items.concat(pagesItems.flat());
    }
    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
