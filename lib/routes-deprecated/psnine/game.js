const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://www.psnine.com/psngame';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('table tr')
        .map(function () {
            const info = {
                title: $(this).find('.title a').text(),
                link: $(this).find('.title a').attr('href'),
                pubDate: parseRelativeDate($(this).find('.meta').text()),
                description: $(this).find('.title span').text() + ' ' + $(this).find('.twoge').text(),
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
