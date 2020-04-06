const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'https://www.gushiwen.org/';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const list = $('div.sons');
    const out = list
        .slice(0, 10)
        .map(function () {
            const title = $(this).find('b').text();
            const link = $(this).find('p a').attr('href');
            const description = $(this).find('div.contson').html();
            const author = $(this).find('p.source').text();
            const item = {
                title,
                link,
                description,
                author,
            };

            return item;
        })
        .get();

    ctx.state.data = {
        title: '古诗文推荐',
        link: url,
        item: out,
    };
};
