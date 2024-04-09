const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://monitor.firefox.com';

    const response = await got(`${baseUrl}/breaches`);
    const $ = cheerio.load(response.data);

    const items = $('.breach-card')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('.breach-detail-link').remove();
            return {
                title: item.find('h3 span').last().text(),
                description: item.find('.breach-main').html(),
                link: new URL(item.attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('.breach-main div dd').first().text()), 0),
                category: item
                    .find('.breach-main div dd')
                    .last()
                    .text()
                    .split(',')
                    .map((x) => x.trim()),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        description: $('head meta[name=description]').attr('content').trim(),
        link: response.url,
        item: items,
        image: $('head meta[property=og:image]').attr('content'),
    };
};
