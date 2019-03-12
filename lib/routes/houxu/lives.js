const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const baseUrl = `https://houxu.app/lives/${type}`;
    const res = await axios.get(baseUrl);
    const $ = cheerio.load(res.data);

    const list = $('div.container > div');
    const out = list
        .map((_, el) => {
            const each = $(el);

            const p = each.find('p');
            return {
                title: each
                    .find('h3')
                    .text()
                    .trim(),
                description: p.html() + p.next().html(),
                link:
                    'https://houxu.app' +
                    each
                        .find('h3 > a')
                        .first()
                        .attr('href'),
            };
        })
        .get();
    ctx.state.data = {
        title: $('title')
            .text()
            .trim(),
        description: $('li.active')
            .text()
            .trim(),
        link: baseUrl,
        item: out,
    };
};
