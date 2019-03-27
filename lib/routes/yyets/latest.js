const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const host = 'http://diaodiaode.me/rss/feed';

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: host,
    });
    const $ = cheerio.load(response.data);
    const list = $('item');

    const process = list.map((index, item) => ({
        title: $(item)
            .find('title')
            .text(),
        description: $(item)
            .find('description')
            .text(),
        guid: $(item)
            .find('guid')
            .text(),
        link: $(item)
            .find('link')
            .text(),
        pubDate: $(item)
            .find('pubDate')
            .text(),
    }));

    ctx.state.data = {
        title: '人人影视 - 更新剧集',
        link: host,
        description: '人人影视 - 更新剧集',
        item: process.get(),
    };
};
