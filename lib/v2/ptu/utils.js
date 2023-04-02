const got = require('@/utils/got');
const cheerio = require('cheerio');
const getPageInfo = (html) => {
    const $ = cheerio.load(html);
    const siteTitle = $("[name=keywords]").attr("content").search(",") !== -1 ? $("[name=keywords]").attr("content").replace("莆田学院", "").split(",")[0].trim() : $("[name=keywords]").attr("content").replace("莆田学院", "").trim();
    const pageTitle = $("[name=pageTitle]").attr("content") ? $("[name=pageTitle]").attr("content").trim()
    : $(".lmmc > h2:nth-child(1)") ? $(".lmmc > h2:nth-child(1)").text().trim()
    : $("a.cur:nth-child(3)") ? $("a.cur:nth-child(3)").text().trim()
    : "无标题";
    const pageSize = $(".p_next").find("a").attr("href")  ? parseInt($(".p_next").find("a").attr("href").match("\\d+")[0]) + 1
     : $("a.Next:nth-child(3)").attr("href")  ? parseInt($("a.Next:nth-child(3)").attr("href").match("\\d+")[0]) + 1
     : 1 ;
    return {
        siteTitle,
        pageTitle,
        pageSize
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

const getAuthor = (html, mode = -1) => {
    const $ = cheerio.load(html);
    const articleInfoBar = $('.bar').text().replace(/\n/g, "");
    const publisher = articleInfoBar.search("发布者：(.*)发布时间") !== -1 ? articleInfoBar.match("发布者：(.*)发布时间").pop().trim() : "";
    const responsibleEditor = articleInfoBar.search("发布者：(.*)发布时间") !== -1 ? articleInfoBar.match("责任编辑：(.*)发布者").pop().trim() : "";
    const article = $('.v_news_content').html().replace(/<p[^>]*?>(.*?)<\/p>/g, '$1\n').replace(/&nbsp;/g, " ").replace(/<\/?.+?>/g, "");
    let authorInArticle = ""; // mode = -1
    if (mode === 1) {
        // news site mode
        authorInArticle = [...article.matchAll(/[(（]([^（()）、]{5,20}?[\W\s]{1,30}?)[）)]/g)].pop();
        authorInArticle = (authorInArticle?.[authorInArticle.length - 1] ?? "");
    }
    else if (mode === 2) {
        authorInArticle = [...article.matchAll(/\s?([^():：时间\n\d。 ]+?)\s+?\d+[年.]\d+[月.]\d+[日.]?/g)].pop();
        authorInArticle = (authorInArticle?.[authorInArticle.length - 1] ?? "");
    }
    authorInArticle = authorInArticle.replace(/(供稿|：|来源|图\/文|文\/图)/g, "");
    // Get the last match result
    const author = authorInArticle !== "" ? authorInArticle
                  : publisher !== "" ? publisher
                  : responsibleEditor !== "" ? responsibleEditor
                  : "";
    return author;
};


const getArticleContent = async (ctx, articleUrl, authorExtractionMode = -1) => {
    const item = await ctx.cache.tryGet(articleUrl, async () => {
        const response = await got({ method: 'get', url: articleUrl }, { https: { rejectUnauthorized: false } });
        const $ = cheerio.load(response.data);
        return {
             author: getAuthor(response.data, authorExtractionMode),
             article: $('.v_news_content').html() };
    });
    return item;
};

module.exports = {
    getPageInfo,
    getPageUrl,
    getArticleContent

};
