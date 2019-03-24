const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const link = `https://www.huxiu.com/search.html?s=${encodeURIComponent(keyword)}&sort=dateline:desc`;

    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('.search-wrap-list-ul > li > h2 > a')
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅网 - ${keyword}`;
    ctx.state.data = {
        title: info,
        link,
        description: info,
        item: items,
    };
};
