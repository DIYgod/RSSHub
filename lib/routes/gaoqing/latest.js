const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://gaoqing.fm/',
        headers: {
            Referer: 'https://gaoqing.fm/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#result1 > li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '高清电台',
        link: 'https://gaoqing.fm',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
