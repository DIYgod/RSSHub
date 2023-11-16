const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://lock.cmpxchg8b.com/';
const title = 'cmpxchg8b';

module.exports = async (ctx) => {
    const { data: response } = await got(baseUrl);

    const $ = cheerio.load(response);
    const author = $('p.author').text().trim();
    const list = $('section#articles section')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('li').text(),
                link: new URL(item.find('li a').attr('href'), baseUrl).toString(),
                author,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                // extract the body but removing <nav> and <footer>
                const body = $('body');
                body.find('nav, footer').remove();
                item.description = body.html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: new URL('#articles', baseUrl).toString(),
        item: items,
    };
};
