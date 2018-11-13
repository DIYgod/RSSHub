const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const url = "http://www.gs.sjtu.edu.cn/index/tzgg/cxgc.htm"
    const response = await axios({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.comm li').get();

    const result = await util.ProcessFeed(list, ctx.cache, url);

    ctx.state.data = {
        title: '上海交大-研究生院-创新工程',
        link: url,
        item: result,
    };
};
