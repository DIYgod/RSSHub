const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `http://www.geekpark.net/column/74`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);
    const author = $('.category-tag').text().trim();

    const list = $('.article-list h3')
        .slice(0, 10)
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const authorInfo = `极客公园 - ${author}`;
    ctx.state.data = {
        title: authorInfo,
        link,
        description: authorInfo,
        item: items,
    };
};
