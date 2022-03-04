const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://movie.douban.com/cinema/later/beijing/',
    });
    const $ = cheerio.load(response.data);

    const item = $('#showing-soon .item')
        .map((index, ele) => {
            const description = $(ele).html();
            const name = $('h3', ele).text().trim();
            const date = $('ul li', ele).eq(0).text().trim();
            const type = $('ul li', ele).eq(1).text().trim();
            const link = $('a.thumb', ele).attr('href');

            return {
                title: `${date} - 《${name}》 - ${type}`,
                link,
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: '即将上映的电影',
        link: 'https://movie.douban.com/cinema/later/',
        item,
    };
};
