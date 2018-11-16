const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.rs05.com/movie/',
        headers: {
            Referer: 'hhttp://www.rs05.com/movie/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.list li');

    ctx.state.data = {
        title: '电影下载网站 免费_人生05_电影下载网站',
        link: 'http://www.rs05.com/movie/',
        description: '电影下载网站 免费_人生05_电影下载网站',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.intro a').attr('title'),
                        description: item.find('.brief').text() + '<img src="' + item.find('.movie-thumbnails img').attr('data-original') + '">',
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: item.find('.movie-thumbnails').attr('href'),
                    };
                })
                .get(),
    };
};
