const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www3.gdou.edu.cn/jwc/',
        responseType: 'buffer',
    });

    // HTML-buffer转为gb2312
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    const list = $('.bor03.cont li').slice(0, 10).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: 'http://www3.gdou.edu.cn/jwc/Item/list.asp?id=1224',
        description: '教务通知',
        item: result,
    };
};
