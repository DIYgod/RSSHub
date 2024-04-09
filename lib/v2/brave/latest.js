const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://brave.com';
    const currentUrl = `${rootUrl}/latest`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.box h3')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();
            const device = item.parent().find('h2').text();
            const matchVersion = title.match(/(v[\d.]+)/);
            const matchDate = title.match(/\((.*?)\)/);

            return {
                title: `[${device}] ${title}`,
                link: currentUrl,
                guid: `${currentUrl}#${device}-${matchVersion?.[1] ?? title}`,
                description: item.next().html(),
                pubDate: parseDate(matchDate?.[1].replace(/(st|nd|rd|th)?,/, ''), ['MMMM D YYYY', 'MMM D YYYY']),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
