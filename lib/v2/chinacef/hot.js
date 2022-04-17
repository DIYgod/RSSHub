const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await got.get('http://www.chinacef.cn/index.php/index/index');

    const data = response.data;

    const $ = cheerio.load(data);

    const domArray = $('#boardright ul');
    const rssTitle = '金融热点 - 首席经济学家论坛';

    const itemArray = await Promise.all(
        domArray
            .map(async (index, item) => {
                item = $(item);
                const itemLink = utils.siteLink + item.find('li a').attr('href');
                const detail = await ctx.cache.tryGet(itemLink, async () => await utils.getArticleDetail(itemLink));

                return {
                    title: detail.title,
                    description: detail.description,
                    link: itemLink,
                    pubDate: detail.time,
                    author: detail.author,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: rssTitle,
        link: utils.siteLink,
        item: itemArray,
    };
};
