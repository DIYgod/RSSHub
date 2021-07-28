const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.wuhaozhan.net/movie/list/',
        headers: {
            Referer: 'http://www.wuhaozhan.net/movie/list/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.pure-g .l-box');
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
                        title: item.find('.pr h1 a').text(),
                        description: item.find('.pr h2').text() + '<img src="' + item.find('.pure-g iframe').attr('src') + '">',
                        pubDate: item.find('.pr .dt').text(),
                        link: item.find('.l-a').attr('href'),
                    };
                })
                .get(),
    };
};
