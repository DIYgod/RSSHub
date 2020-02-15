const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.keyakizaka46.com/s/k46o/news/list',
        headers: {
            Referer: 'http://www.keyakizaka46.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.keyaki-news div.box-news ul li');

    ctx.state.data = {
        allowEmpty: true,
        title: '欅坂46官网 NEWS',
        link: 'http://www.keyakizaka46.com/news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item
                            .find('div.text a')
                            .first()
                            .text(),
                        link: item.find('div.text a').attr('href'),
                        pubDate: item
                            .find('div.date')
                            .first()
                            .text(),
                    };
                })
                .get(),
    };
};
