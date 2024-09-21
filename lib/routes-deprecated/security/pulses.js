const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://sec.today';

module.exports = async (ctx) => {
    const link = 'https://sec.today/pulses/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const out = $('div.endless_page_template div.card')
        .slice(0, 10)
        .map(function () {
            const author = $(this).find('div.card-body small.text-muted').text().trim().split('•')[0];
            const itemUrl = $(this).find('h5.card-title > a').attr('href');
            const info = {
                link: url.resolve(host, itemUrl),
                description: $(this).find('p.card-text.my-1').html(),
                title: $(this).find('h5.card-title').text(),
                author,
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '每日安全推送',
        link,
        item: out,
    };
};
