const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://news.zjgsu.edu.cn/18/',
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('ul.list-1 li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '浙江工商大学新闻网-通知公告',
        link: 'http://news.zjgsu.edu.cn/18/',
        description: '浙江工商大学新闻网-通知公告',
        item: result,
    };
};
