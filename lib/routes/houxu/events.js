const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = `https://houxu.app/events`;
    const res = await axios.get(baseUrl);
    const data = res.data;
    const $ = cheerio.load(data);

    const list = $('div.list > div');
    const descriptionSelector = '.summary';
    const out = list
        .map((_, el) => {
            const each = $(el);
            return {
                title:
                    each
                        .find('a')
                        .first()
                        .text()
                        .trim() +
                    ' | ' +
                    each
                        .find('h3')
                        .text()
                        .trim(),
                description: each
                    .find(descriptionSelector)
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
        description: $('title')
            .text()
            .trim(),
        link: baseUrl,
        item: out,
    };
};
