const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.jianshu.com/c/${id}`,
        headers: {
            Referer: `https://www.jianshu.com/c/${id}`,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.jianshu.com/c/${id}`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    };
};
