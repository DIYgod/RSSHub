const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://news.cqu.edu.cn/newsv2/info-24.html',
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.item').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '重庆大学新闻网-讲座预告',
        link: 'http://news.cqu.edu.cn/newsv2/info-24.html',
        description: '重庆大学新闻网-讲座预告',
        item: result,
    };
};
