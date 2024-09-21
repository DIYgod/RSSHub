const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://www.psnine.com/dd';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.dd_ul li')
        .map(function () {
            const info = {
                title: $(this).find('.dd_title').text(),
                link: $(this).find('.dd_title a').attr('href'),
                description: $(this).find('.dd_status').text(),
                pubDate: parseRelativeDate($(this).find('.meta').text()),
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
