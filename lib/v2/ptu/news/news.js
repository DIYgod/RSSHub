const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
// const utils = require('./utils');

const baseUrl = 'https://news.ptu.edu.cn/';


const getPageInfo = (html) => {
    const $ = cheerio.load(html);
    return {
        pageTitle: $(".lmmc > h2:nth-child(1)").text().trim(),
        pageSize: parseInt($(".p_next").find("a").attr("href").match("\\d+")[0]) + 1
    };
};

const getPageUrl = (url, pageId, pageSize) => {
    pageId = parseInt(pageId);
    if (pageId && pageId !== 1) {
        const currentPagePath = `/${pageSize - pageId + 1}.htm`;
        const pageUrl = url.slice(0, -4) + currentPagePath;
        return pageUrl;
    }
    return url;
};

const getAuthor = (html) => {
    const $ = cheerio.load(html);
    const articleInfoBar = $('.bar').text().replace(/\n/g, "");
    const publisher = articleInfoBar.match("发布者：(.*)发布时间")[1].trim();
    const responsibleEditor = articleInfoBar.match("责任编辑：(.*)发布者")[1].trim();

    // Get the last match result
    let authorInArticle = [...$('.v_news_content').text().matchAll(/[(（]([^（()）、]{5,20}?[\W\s]{1,30}?)[）)]/g)].pop();
    // console.log (authorInArticle)
    authorInArticle = (authorInArticle?.[authorInArticle.length - 1] ?? "").replace(/(供稿|：|来源|图\/文|文\/图)/g, "");
    const author = authorInArticle !== "" ? authorInArticle
                  : publisher !== "" ? publisher
                  : responsibleEditor !== "" ? responsibleEditor
                  : "";
    return author;
};


const getArticleContent = async (ctx, articleUrl) => {
    const item = await ctx.cache.tryGet(articleUrl, async () => {
        const response = await got({ method: 'get', url: articleUrl }, { https: { rejectUnauthorized: false } });
        const $ = cheerio.load(response.data);
        return {
             author: getAuthor(response.data),
             article: $('.v_news_content').html() };
    });
    return item;
};

const getArticleList = async (ctx, url, pageId, pageSize = null) => {
    let response, pageTitle;
    if (pageSize === null) {
        // get pageSize
        response = await got({method: 'get', url}, { https: { rejectUnauthorized: false } });
        const {pageTitle: _1, pageSize: _2} = getPageInfo(response.data);
        pageTitle  = _1;
        pageSize = _2;
    }
    const pageUrl = getPageUrl(url, pageId, pageSize);
    if (pageUrl !== url) {
        // go to target url
        response = await got({method: 'get', url: pageUrl}, { https: { rejectUnauthorized: false } });
    }

    const $ = cheerio.load(response.data);
    const list = $('li.clearfix');
    return list.map(async (_, item) => {
        item = $(item);

        const title = item.find('a').first().text();
        const articleUrl = item.find('a').attr('href').startsWith('../') ? new URL(item.find('a').attr('href'), baseUrl).href : baseUrl + item.find('a').attr('href');
        const { author, article } = await getArticleContent(ctx, articleUrl);

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
    }).get();
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
