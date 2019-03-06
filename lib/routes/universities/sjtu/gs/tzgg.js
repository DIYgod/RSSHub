const axios = require('../../../../utils/axios');
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

    const response = await axios({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.comm li').splice(0, 10);

    const result = await util.ProcessFeed(list, ctx.cache, url);

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: result,
    };
};
