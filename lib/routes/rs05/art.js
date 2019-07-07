const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.wuhaozhan.net/review/',
        headers: {
            Referer: 'http://www.wuhaozhan.net/review/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('body > div.container > div > div.pure-u-1 > div.hot.pure-g > div');
    ctx.state.data = {
        title: '人生05影评',
        link: 'http://www.wuhaozhan.net/movie/list/',
        description: '人生05电影更新列表',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('div > div.content > h2 > a').text(),
                        description: item.find('div > div.content > p').text() + '<img src="' + item.find('div > div.thumb > a > img').attr('data-original') + '">',
                        pubDate: new Date(item.find('div > div.news-bar.clearfix > span').text()).toUTCString(),
                        link: item.find('div > div.thumb > a').attr('href'),
                    };
                })
                .get(),
    };
};
