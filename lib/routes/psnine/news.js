const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = 'https://www.psnine.com/news';
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.box li')
        .map(function () {
            const info = {
                title: $(this).find('.content').text(),
                link: $(this).find('.touch').attr('href'),
                pubDate: date($(this).find('.meta').text()),
                author: $(this).find('.meta a').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: 'psnine-' + $('title').text(),
        link: 'https://www.psnine.com/',
        item: out,
    };
};
