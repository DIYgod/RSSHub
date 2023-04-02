const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');


async function getArticleList(ctx, baseUrl, url, pageId, pageSize = null) {


    let response, pageTitle, siteTitle;
    if (pageSize === null) {
        // get pageSize
        response = await got({method: 'get', url}, { https: { rejectUnauthorized: false } });
        // console.log(url);
        const {pageTitle: _1, pageSize: _2, siteTitle: _3} = utils.getPageInfo(response.data);
        pageTitle  = _1;
        pageSize = _2;
        siteTitle = _3;

        // console.log(pageTitle, pageSize);
    }
    const pageUrl = utils.getPageUrl(url, pageId, pageSize);
    if (pageUrl !== url) {
        // go to target url
        // console.log(pageUrl);
        response = await got({method: 'get', url: pageUrl}, { https: { rejectUnauthorized: false } });
    }

    const $ = cheerio.load(response.data);


    const list = $("[id^=line]").parent().find("li");
    // console.log(list.length);
    return Promise.all(list.map(async (_, item) => {
        item = $(item);
        const title = item.find('a').find("em").length !== 0  ? item.find('a').find("em").first().text()
                : item.find('a').attr("title") ? item.find('a').attr("title").trim()
                : item.find('a').first() ? item.find('a').first().text().trim()
                : "Untitle";
        const articleUrl = baseUrl + item.find('a').attr('href').replace(/\.\.\//g, "");

        const { author, article } = await utils.getArticleContent(ctx, articleUrl, 2);

        const pubDate = item.find("span").first().text().trim();
        // console.log(pubDate);
        return {
            title,
            author,
            description: article,
            link: articleUrl,
            pubDate: timezone(parseDate(pubDate, "YYYY-MM-DD"), +8),
                            // extra info
                            pageUrl,
                            siteTitle,
                            pageTitle,
                            pageSize,
        };
    }).get());
}

module.exports = async (ctx) => {
    let { campus, path } = ctx.params;
    campus = campus ? campus : "xgk";
    // const path = path ? path : "tzgg";
    const baseUrl = `https://www.ptu.edu.cn/${campus}/`;
    let pageId = 1;
    if (path.search("/") !== -1) {
        if (!isNaN(parseInt(path.split("/").pop()))) {
            pageId = parseInt(path.split("/").pop());
            path = path.slice(0, path.lastIndexOf("/"));
            // console.log("Here");
        }

    }

    let url = `https://www.ptu.edu.cn/${campus}/index/${path}.htm`;
    try {
        await got({
            method: 'head',
            url,
        }, { https: { rejectUnauthorized: false } });
    }
    catch (error) {
        if (error.response && error.response.status === 404) {
            url = `https://www.ptu.edu.cn/${campus}/${path}.htm`;
        }
        else {
            throw error;
        }
    }

    // console.log(baseUrl, url, pageId);
    let items = await getArticleList(ctx, baseUrl, url, pageId);
    const pageInfo = items[0];
    // console.log(items);

    const title = `${pageInfo.pageTitle} - 莆田学院${pageInfo.siteTitle}`;
    const pageSize = pageInfo.pageSize;

    if (pageId === 'all') {
        const pagePromises = [];
        for (let i = 2; i <= pageSize; i++) {
            pagePromises.push(getArticleList(ctx, baseUrl, url, i, pageSize));
        }
        const pagesItems = await Promise.all(pagePromises);
        items = items.concat(pagesItems.flat());
    }
    // console.log(items.length);
    ctx.state.data = {
        title,
        link: pageInfo.pageUrl,
        item: items,
    };
};
