const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.dekudeals.com/';
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = url.resolve(host, type);

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('body > main > div:nth-child(1) > div > h3').text();
    const list = $('body > main > div:nth-child(2) > div > table > tbody > tr');

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const title = item.find('td:nth-child(2) > a').text();
                const link = url.resolve(host, item.find('td:nth-child(2) > a').attr('href'));
                const img = item.find('td.image img').attr('src');
                const price = item.find('td:nth-child(3)').html();
                const description = `<img referrerpolicy="no-referrer" src="${img}">` + '<br>' + price;

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
        link: link,
        item: out,
    };
};
