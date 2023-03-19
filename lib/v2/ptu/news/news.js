const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://news.ptu.edu.cn/';


async function getPageInfo(url) {
    const response = await got({method: 'get', url}, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    return {
        pageTitle: $(".lmmc > h2:nth-child(1)").text().trim(),
        pageSize: parseInt($(".p_next").find("a").attr("href").match("\\d+")[0]) + 1
    };
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

    const {pageSize, pageTitle} = await getPageInfo(url);
    let items = [];
    const title = `${pageTitle} - 莆田学院新闻网`;

    if (pageId === 'all') {
        const pagePromises = [];
        for (let i = 1; i <= pageSize; i++) {
            const pageUrl = getPageUrl(url, i, pageSize);
            pagePromises.push(getArticleList(ctx, pageUrl));
        }

        const pagesItems = await Promise.all(pagePromises);
        items = pagesItems.flat();
    } else {
        const pageUrl = getPageUrl(url, pageId, pageSize);
        const pageItems = await Promise.all(await getArticleList(ctx, pageUrl));
        items = pageItems;
    }

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
