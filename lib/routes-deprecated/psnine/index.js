const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://www.psnine.com/';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.list li')
        .slice(0, 20)
        .map(function () {
            const info = {
                title: $(this).find('.title').text(),
                link: $(this).find('.title a').attr('href'),
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
