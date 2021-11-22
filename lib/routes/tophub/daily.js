const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://tophub.today/daily`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);
    //const author = $('.user-name').text().trim();

    const list = $('.kt-t__item a')
        .slice(0, 10)
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const authorInfo = `虎嗅网 - ${author}`;
    ctx.state.data = {
        //title: authorInfo,
        link,
        description: authorInfo,
        item: items,
    };
};
