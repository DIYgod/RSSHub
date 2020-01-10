const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.hinatazaka46.com/s/official/news/list',
        headers: {
            Referer: 'http://www.hinatazaka46.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('main div.l-maincontents--news ul.p-news__list li');

    ctx.state.data = {
        allowEmpty: true,
        title: '日向坂46官网 NEWS',
        link: 'http://www.hinatazaka46.com/news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item
                            .find('a p.c-news__text')
                            .first()
                            .text(),
                        link: item.find('a').attr('href'),
                        pubDate: item
                            .find('a time.c-news__date')
                            .first()
                            .text(),
                    };
                })
                .get(),
    };
};
