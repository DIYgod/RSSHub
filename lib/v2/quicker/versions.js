const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/Help/Versions`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.version')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text().trim(),
                link: `${rootUrl}${a.attr('href')}`,
                description: item.find('.article-content').html(),
                pubDate: parseDate(item.find('.text-secondary').first().text()),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
