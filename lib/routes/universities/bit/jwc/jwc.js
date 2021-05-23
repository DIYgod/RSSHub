const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://jwc.bit.edu.cn/tzgg',
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.crules div').slice(0, 10).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: 'http://jwc.bit.edu.cn/tzgg',
        description: '北京理工大学教务部',
        item: result,
    };
};
