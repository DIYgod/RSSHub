const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.a9vg.com/news/',
        headers: {
            Referer: 'http://www.a9vg.com/news/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.txt-r-img.combine2 dl');

    ctx.state.data = {
        title: 'A9VG电玩部落',
        link: 'http://www.a9vg.com/news/',
        description: '电玩资讯_电玩动态- A9VG电玩部落',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.img-scale').attr('title'),
                        description: item.find('p').text() + '<img src="' + item.find('img').attr('src') + '">',
                        pubDate: new Date(item.find('.time').text()).toUTCString(),
                        link: item.find('.img-scale').attr('href'),
                    };
                })
                .get(),
    };
};
