const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.zyshow.net';
    const currentUrl = `${rootUrl}${ctx.path.replace(/\/$/, '')}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('table')
        .last()
        .find('tr td a img.icon-play')
        .toArray()
        .map((item) => {
            item = $(item).parentsUntil('tbody');

            const a = item.find('a[title]').first();
            const guests = item.find('td').eq(2).text();

            return {
                title: a.text(),
                link: `${currentUrl}v/${a.attr('href').split('/v/').pop()}`,
                pubDate: parseDate(a.text().match(/(\d{8})$/)[1], 'YYYYMMDD'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    date: item.find('td').first().text(),
                    subject: item.find('td').eq(1).text(),
                    guests,
                }),
                category: guests.split(/,|;/),
            };
        });

    ctx.state.data = {
        title: `综艺秀 - ${$('h2').text()}`,
        link: currentUrl,
        item: items,
    };
};
