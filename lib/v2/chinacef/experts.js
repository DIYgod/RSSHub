const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await got(`http://www.chinacef.cn/index.php/experts/zjmain/experts_id/${ctx.params.experts_id}`);

    const data = response.data;

    const $ = cheerio.load(data);

    const domArray = $('div[class^="leftnews"]');
    const rssTitle = $('title').text().trim();

    const itemArray = await Promise.all(
        domArray
            .filter((index, item) => undefined !== $(item).find('h2 > a').attr('href'))
            .map(async (index, item) => {
                item = $(item);
                const itemLink = utils.siteLink + item.find('h2 > a').attr('href');
                const detail = await ctx.cache.tryGet(itemLink, async () => await utils.getArticleDetail(itemLink));

                return {
                    title: detail.title,
                    description: detail.description,
                    link: itemLink,
                    pubDate: detail.time,
                    author: detail.author,
                };
            })
    );

    ctx.state.data = {
        title: rssTitle,
        link: utils.siteLink,
        item: itemArray,
    };
};
