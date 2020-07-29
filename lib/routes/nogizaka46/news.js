const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.nogizaka46.com/news/',
        headers: {
            Referer: 'http://www.nogizaka46.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#news #sheet div.left div.padding ul li');

    ctx.state.data = {
        allowEmpty: true,
        title: '乃木坂46官网 NEWS',
        link: 'http://www.nogizaka46.com/news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title strong a').first().text(),
                        description: item.find('.summary').first().text(),
                        link: item.find('.title strong a').attr('href'),
                        pubDate: item.find('.date').first().text(),
                    };
                })
                .get(),
    };
};
