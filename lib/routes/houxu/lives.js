const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const baseUrl = `https://houxu.app/lives/${type}`;
    const res = await axios.get(baseUrl);
    const $ = cheerio.load(res.data);

    const list = $('div.live-realtime');
    const out = list
        .map((_, el) => {
            const each = $(el);

            return {
                title: each
                    .find('h4 > a')
                    .text()
                    .trim(),
                link: 'https://houxu.app' + each.find('h4 > a').attr('href'),
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
