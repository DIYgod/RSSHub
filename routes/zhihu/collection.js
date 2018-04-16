const axios = require('axios');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.zhihu.com/collection/${id}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://www.zhihu.com/collection/${id}`
        }
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.zm-item');

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${$('#zh-fav-head-description').text()}`,
        lastBuildDate: new Date().toUTCString(),
        item: list && list.map((index, item) => {
            item = $(item);
            return {
                title: item.find('.zm-item-title a').text(),
                description: `内容：${item.find('textarea').text()}`,
                link: `https://www.zhihu.com${item.find('.zm-item-title a').attr('href')}`
            };
        }).get(),
    });
};