const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = 'https://www.psnine.com/trade';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.list li')
        .map(function () {
            const desc = [];
            $(this)
                .find('.meta a')
                .each(function (i) {
                    desc[i] = $(this).text();
                });
            const info = {
                title: $(this).find('.content').text(),
                link: $(this).find('.touch').attr('href'),
                description: desc.join(' '),
                pubDate: date($(this).find('.meta').text()),
                author: $(this).find('.psnnode').text(),
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
