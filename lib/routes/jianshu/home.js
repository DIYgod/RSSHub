const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.jianshu.com',
        headers: {
            Referer: 'https://www.jianshu.com',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '简书首页',
        link: 'https://www.jianshu.com',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
