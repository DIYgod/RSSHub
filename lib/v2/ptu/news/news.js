const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://news.ptu.edu.cn/';


async function getPageSize(ctx, url) {
    const response = await got({method: 'get', url}, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    return parseInt($(".p_next").find("a").attr("href").match("\\d+")[0]) + 1;
}

function getPageUrl(url, pageId, pageSize) {
    pageId = parseInt(pageId);
    if (pageId && pageId !== 1) {
        const currentPagePath = `/${pageSize - pageId + 1}.htm`;
        const pageUrl = url.slice(0, -4) + currentPagePath;
        return pageUrl;
    }
    return url;
}

const getArticleContent = async (ctx, link) => {
    const item = await ctx.cache.tryGet(link, async () => {
        const response = await got({ method: 'get', url: link }, { https: { rejectUnauthorized: false } });
        const $ = cheerio.load(response.data);
        const publisher = $('.bar').text().match("发布者：(.*)发布时间")[1].trim();
        const responsibleEditor = $('.bar').text().match("责任编辑：(.*)发布者")[1].trim();

        // Get the last match result
        let authorInArticle = [...$('.v_news_content').text().matchAll(/[(（]([\W]{3,20}?[\W\s]{2,30}?)[）)]/g)].pop();
        // console.log (authorInArticle)
        authorInArticle = authorInArticle !== undefined ? authorInArticle[authorInArticle.length - 1].replace("供稿", "").replace("：", "") : "";
        const author = authorInArticle !== "" ? authorInArticle
                      : publisher !== "" ? publisher
                      : responsibleEditor;
        return {
             author,
             article: $('.v_news_content').html() };
    });
    return item;
};

async function getArticleList(ctx, pageUrl) {
    const response = await await got({ method: 'get', url: pageUrl }, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const list = $('li.clearfix');

    return list.map(async (_, item) => {
        item = $(item);

        const title = item.find('a').first().text();
        const link = baseUrl + item.find('a').attr('href');
        const { author, article } = await getArticleContent(ctx, link);

        const day = item.find("div.fl.time").find("p").first().text().trim();
        const year_month = item.find("div.fl.time").find("p").last().text().trim();
        const pubDate = year_month + "." + day;

        return {
            title,
            author,
            description: article,
            link,
            pubDate: timezone(parseDate(pubDate, "YYYY.MM.DD"), +8),
        };
    }).get();
}

module.exports = async (ctx) => {
    const { type, pageId } = ctx.params;
    const path = type ? type : "pyyw";
    const url = `https://news.ptu.edu.cn/${path}.htm`;

    const PageSize = await getPageSize(ctx, url);
    let items = [];

    const response = await got({ method: 'get', url }, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const pageTitle = $(".lmmc > h2:nth-child(1)").text().trim();
    const title = `${pageTitle} - 莆田学院新闻网`;

    if (pageId === 'all') {
        for (let i = 1; i <= PageSize; i++) {
            const pageUrl = getPageUrl(url, i, PageSize);
            const pageItems = Promise.all(getArticleList(ctx, pageUrl));
            items = items.concat(pageItems);
        }
    } else {
        const pageUrl = getPageUrl(url, pageId, PageSize);
        const pageItems = await Promise.all(await getArticleList(ctx, pageUrl));
        items = items.concat(pageItems);
    }

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
