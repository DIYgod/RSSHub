const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.wuhaozhan.net/movie/list/',
        headers: {
            Referer: 'http://www.wuhaozhan.net/movie/list/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.pure-u-md-16-24 .l-box');

    ctx.state.data = {
        title: '人生05电影更新列表',
        link: 'http://www.wuhaozhan.net/movie/list/',
        description: '人生05电影更新列表',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.pure-u-16-24 h1 a').text(),
                        description: item.find('.pure-u-16-24 .l-des').text() + '<img src="' + item.find('.pure-u-8-24 a .l-img').attr('data-original') + '">',
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: item.find('.pure-u-8-24 a').attr('href'),
                    };
                })
                .get(),
    };
};
