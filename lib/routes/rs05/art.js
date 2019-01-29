const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.rs05.com/',
        headers: {
            Referer: 'http://www.rs05.com/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    //const $ = cheerio.load('<h2 class="title 123">Hello world</h2>');
    const list = $('.pure-g .pure-u-md-1-2');
//    const list = $('.title.123');
//    console.log(list.html());


    ctx.state.data = {
        title: '人生05电影文章列表',
        link: 'http://www.rs05.com/',
        description: '人生05电影文章列表',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    //console.log(item.text());
                    return {
                        title: item.find('.content h2 a').text(),
                        description: item.find('.content p').text() + '<img src="' + item.find('.thumb a .pure-img').attr('data-original') + '">',
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: 'http://www.rs05.com/'+item.find('.content h2 a').attr('href'),
                    };
                })
                .get(),
    };
};
