const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const host = 'https://www.dekudeals.com/';
    const link = url.resolve(host, type);

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('#search-title').text();
    const list = $('.search-main > .item-grid2 > div');

    const out = await Promise.all(
        list
            .map((index, item) => {
                item = $(item);
                const title = item.find('.name').text();
                const link = url.resolve(host, item.find('.main-link').attr('href'));
                const img = item.find('.main-link img').attr('src');
                const price = item.find('strong').html();
                const oldprice = item.find('s.text-muted').html();
                const description = `<img src="${img}"><br><s>${oldprice}</s><br>${price}`;

                const single = {
                    title,
                    link,
                    description,
                };

                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title: `${title}—dekudeals`,
        link,
        item: out,
    };
};
