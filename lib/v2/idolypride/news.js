const { art } = require('@/utils/render');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');

module.exports = async (ctx) => {

    const response = await got({
        method: 'get',
        url: 'https://idolypride.jp/news',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.lists__list li');
    ctx.state.data = {
        title: '偶像荣耀-新闻',
        link: 'https://idolypride.jp/news',
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);

                    const title = item.find('span.lists__list__text').first().text();
                    const link = item.find('a').attr('href');
                    const pic = item.find('span.lists__list__img').attr('style').match(/\('(.*?)'\)/)[1];

                    return {
                        title,
                        link,
                        description: art(path.join(__dirname, '../idolypride/templates/news.art'), {
                            pic,
                        }),
                    };
                })
                .get(),
    };
};