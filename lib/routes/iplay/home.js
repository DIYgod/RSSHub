const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const url = `https://www.iplaysoft.com/`;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('#postlist .entry').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text().split('-')[0],
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
