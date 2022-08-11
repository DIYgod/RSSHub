const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'shutup10';

    const rootUrl = 'https://www.oo-software.com';
    const currentUrl = `${rootUrl}/en/${id}/changelog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.content h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            return {
                title,
                link: `${currentUrl}#${title.split(' – ')[0]}`,
                description: item.next().html(),
                pubDate: parseDate(title.match(/released (on )?(.*)$/)[2], 'MMMM DD, YYYY'),
            };
        });

    items[0].enclosure_url = $('.banner-inlay').find('a').attr('href');

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
