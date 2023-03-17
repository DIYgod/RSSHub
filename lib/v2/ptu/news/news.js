const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://news.ptu.edu.cn/';


async function getPageSize(url) {
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
        const publisher = $('.bar').text().match("发布者：(.*)发布时间");
        const responsibleEditor = $('.bar').text().match("责任编辑：(.*)发布者");

        // Get the last match result
        let authorInArticle = [...$('.v_news_content').text().matchAll(/[(（]([^（()）、]{5,20}?[\W\s]{2,30}?)[）)]/g)].pop();
        // console.log (authorInArticle)
        authorInArticle = (authorInArticle?.[authorInArticle.length - 1] ?? "").replace(/(供稿|：|来源|图\/文|文\/图)/g, "");
        const author = authorInArticle !== "" ? authorInArticle
                      : publisher !== null ? publisher[1].trim()
                      : responsibleEditor !== null ? responsibleEditor[1].trim()
                      : "";
        return {
             author,
             article: $('.v_news_content').html() };
    });
    return item;
};

async function getArticleList(ctx, pageUrl) {
    const response = await got({ method: 'get', url: pageUrl }, { https: { rejectUnauthorized: false } });
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

    const PageSize = await getPageSize(url);
    let items = [];

    const response = await got({ method: 'get', url }, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const pageTitle = $(".lmmc > h2:nth-child(1)").text().trim();
    const title = `${pageTitle} - 莆田学院新闻网`;

    if (pageId === 'all') {
        const pagePromises = [];
        for (let i = 1; i <= PageSize; i++) {
            const pageUrl = getPageUrl(url, i, PageSize);
            pagePromises.push(getArticleList(ctx, pageUrl));
        }

        const pagesItems = await Promise.all(pagePromises);
        items = pagesItems.flat();
    } else {
        const pageUrl = getPageUrl(url, pageId, PageSize);
        const pageItems = await Promise.all(await getArticleList(ctx, pageUrl));
        items = pageItems;
    }

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
