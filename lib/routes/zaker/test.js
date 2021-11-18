const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `http://www.myzaker.com/channel/${id}`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);
    const author = $('.tit no_decs').text().trim();

    const list = $('.article-wrap a')
        .slice(0, 10)
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const authorInfo = `Zaker - ${author}`;
    ctx.state.data = {
        title: authorInfo,
        link,
        description: authorInfo,
        item: items,
    };
};
