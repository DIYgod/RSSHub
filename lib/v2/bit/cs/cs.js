const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const link = 'https://cs.bit.edu.cn/tzgg/';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);

    const list = $('.box_list01 li').toArray();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
