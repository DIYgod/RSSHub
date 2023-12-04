const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rssTitle = '最新更新 - 首席经济学家论坛';
    const regex = /^\/index\.php\/index\/article\/article_id\/\d+/g;

    const response = await got.get('http://www.chinacef.cn/index.php/index/index');
    const $ = cheerio.load(response.data);

    const articlesLinkListNode = $('a[target=_black]')
        .filter((_, item) => item.attribs.href.match(regex))
        .map((_, item) => item.attribs.href);
    const articlesLinkList = Array.from(new Set(articlesLinkListNode));

    const articles = await Promise.all(
        articlesLinkList.map(async (item) => {
            const articlesLink = utils.siteLink + item;

            const detail = await ctx.cache.tryGet(articlesLink, () => utils.getArticleDetail(articlesLink));

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
