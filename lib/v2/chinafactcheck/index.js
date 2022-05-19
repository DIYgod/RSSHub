const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rssTitle = '有据|国际新闻事实核查';

    const response = await got('https://chinafactcheck.com');
    const $ = cheerio.load(response.data);

    const articlesLinkListNode = $('.post-info-box .post-thumb a')
        .map((_, item) => $(item).attr('href'))
        .get();
    const articlesLinkList = Array.from(new Set(articlesLinkListNode));

    const articles = await Promise.all(
        articlesLinkList.map(async (item) => {
            const articlesLink = item;

            const detail = await ctx.cache.tryGet(articlesLink, async () => await utils.getArticleDetail(articlesLink));

            const element = {
                title: detail.title,
                author: detail.author,
                pubDate: detail.time,
                description: detail.description,
                link: articlesLink,
            };
            return element;
        })
    );

    ctx.state.data = {
        title: rssTitle,
        link: utils.siteLink,
        item: articles,
    };
};
