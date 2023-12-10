const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const link = 'https://jwc.bit.edu.cn/tzgg/';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);

    const list = $('li.gpTextArea').toArray();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link,
        description: '北京理工大学教务部',
        item: result,
    };
};
