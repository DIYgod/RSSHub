const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.huxiu.com/tags/${id}.html`;
    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.related-article li a')
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅 - ${$('.tag-title').text()}`;
    ctx.state.data = {
        title: info,
        link,
        description: info,
        item: items,
    };
};
