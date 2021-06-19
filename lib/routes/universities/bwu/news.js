const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const title = '通知公告';
    const host = 'http://news.bwu.edu.cn/';
    const path = 'tzgg.htm';

    const response = await got({
        method: 'get',
        url: host + path,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('div[class=subPage] div ul li').slice(0, 25).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: title + ' - 物院新闻',
        link: host + path,
        description: title + ' - 北京物资学院新闻中心',
        item: result,
    };
};
