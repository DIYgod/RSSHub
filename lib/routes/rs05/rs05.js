const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.rs05.com/movie/',
        headers: {
            Referer: 'http://www.rs05.com/movie/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.list ul li');

    ctx.state.data = {
        title: '人生05电影更新列表',
        link: 'http://www.rs05.com/movie/',
        description: '人生05电影更新列表',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.intro h2 a').attr('title'),
                        description: item.find('.brief').text() + '<img referrerpolicy="no-referrer" src="' + item.find('.movie-thumbnails .pure-img').attr('data-original') + '">',
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: item.find('.intro h2 a').attr('href'),
                    };
                })
                .get(),
    };
};
