const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.jianshu.com/u/${id}`,
        headers: {
            Referer: `https://www.jianshu.com/u/${id}`,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.jianshu.com/u/${id}`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    };
};
