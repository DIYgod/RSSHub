const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let url = '';
    if (type) {
        url = `http://www.gs.sjtu.edu.cn/index/tzgg/${type}.htm`;
    } else {
        url = 'http://www.gs.sjtu.edu.cn/index/tzgg.htm';
    }

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.comm li').slice(0, 10).get();

    const result = await util.ProcessFeed(list, ctx.cache, url);

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: result,
    };
};
