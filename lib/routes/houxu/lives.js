const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const baseUrl = `https://houxu.app/lives/${type}`;
    const res = await axios.get(baseUrl);
    const data = res.data;
    const $ = cheerio.load(data);

    const list = $('div.list > div');
    const out = list
        .map((_, el) => {
            const each = $(el);
            return {
                title:
                    each
                        .find('cite')
                        .text()
                        .trim() +
                    ' | ' +
                    each
                        .find('a')
                        .first()
                        .text()
                        .trim(),
                description: each
                    .find('p > a')
                    .contents()
                    .filter(function() {
                        return this.nodeType === 3;
                    })
                    .text()
                    .trim(),
                link:
                    'https://houxu.app' +
                    each
                        .find('a')
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
