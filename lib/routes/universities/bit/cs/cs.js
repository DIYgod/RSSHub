const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://cs.bit.edu.cn/tzgg',
    });

    const $ = cheerio.load(response.data);

    const list = $('.box_list01 li')
        .slice(0, 10)
        .get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: 'http://cs.bit.edu.cn/tzgg',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
