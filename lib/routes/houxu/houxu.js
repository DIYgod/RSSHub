const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type, id } = ctx.params;
    const baseUrl = `https://houxu.app/${type}/${id}`;
    const res = await axios.get(baseUrl);
    const data = res.data;
    const $ = cheerio.load(data);

    const list = $('section.threads > div').get();
    const descriptionSelector = type === 'live' ? '.summary' : '.readable';
    const out = list.map((item) => {
        const each = $(item);
        return {
            title: each
                .find('a')
                .text()
                .trim(),
            description: each
                .find(descriptionSelector)
                .text()
                .trim(),
            link: each.find('a').attr('href'),
        };
    });
    ctx.state.data = {
        title: $('.large-title').text(),
        description: $('title')
            .text()
            .trim(),
        link: baseUrl,
        item: out,
    };
};
