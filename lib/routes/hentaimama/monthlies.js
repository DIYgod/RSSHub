const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://hentaimama.io/new-monthly-hentai/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.item.tvshows');

    ctx.state.data = {
        title: 'Hentaimama - Monthly Hentai',
        link: 'http://hentaimama.io/new-monthly-hentai/',
        language: 'en-us',
        item: list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('img').attr('alt'),
                    description: '<img src="' + item.find('img').attr('src') + '">',
                    pubDate: item.find('.data span').text(),
                    guid: new Date(item.find('.data span').text()),
                    link: item.find('a').attr('href'),
                };
            })
            .get(),
    };
};
