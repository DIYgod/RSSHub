const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const utils = require('../utils');

const baseUrl = 'https://www.ptu.edu.cn/';


async function getArticleList(ctx, url, pageId, pageSize = null) {


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
    const list = $('ul.news-list > li');
    return list.map(async (_, item) => {
        item = $(item);

        const title = item.find('a').first().text();
        const articleUrl = item.find('a').attr('href').startsWith('../') ? new URL(item.find('a').attr('href'), baseUrl).href : baseUrl + item.find('a').attr('href');
        const { author, article } = await utils.getArticleContent(ctx, articleUrl, 2);

        const pubDate = item.find("span").first().text().trim();

        return {
            title,
            author,
            description: article,
            link: articleUrl,
            pubDate: timezone(parseDate(pubDate, "YYYY-MM-DD"), +8),
                            // extra info
                            pageTitle,
                            pageSize,
        };
    }).get();
}

module.exports = async (ctx) => {
    const { type, pageId } = ctx.params;
    const path = type ? type : "xngg";
    const url = `https://www.ptu.edu.cn/index/${path}.htm`;

    let items = await getArticleList(ctx, url, pageId);
    const pageInfo = await items[0];
    const title = `${pageInfo.pageTitle} - 莆田学院`;
    const pageSize = pageInfo.pageSize;


    if (pageId === 'all') {
        const pagePromises = [];
        for (let i = 2; i <= pageSize; i++) {
            pagePromises.push(getArticleList(ctx, url, i, pageSize));
        }
        const pagesItems = await Promise.all(pagePromises);
        items = items.concat(pagesItems.flat());
    }
    // console.log(items.length);
    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
