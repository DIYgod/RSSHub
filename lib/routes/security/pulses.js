const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://sec.today';

module.exports = async (ctx) => {
    const link = 'https://sec.today/pulses/';
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const out = $('div.endless_page_template div.row')
        .slice(0, 10)
        .map(function() {
            const author = $(this)
                .find('div.card-text small.text-muted')
                .text()
                .trim()
                .split('•')[0];

            const itemUrl = $(this)
                .find('h5.card-title > a')
                .attr('href');
            const info = {
                link: url.resolve(host, itemUrl),
                description: $(this)
                    .find('p.card-text.my-1')
                    .html(),
                title: $(this)
                    .find('h5.card-title')
                    .text(),
                author: author,
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '每日安全推送',
        link: link,
        item: out,
    };
};
