const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.hicairo.com';
    const { data: response } = await got(`${url}/feed.php`);
    const $ = cheerio.load(response, {
        xmlMode: true,
    });

    const list = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('title').text(),
                description: item.find('description').text(),
                link: item.find('link').text().split('?utm_source')[0],
                pubDate: parseDate(item.find('pubDate').text()),
            };
        });

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => parseItem)));

    ctx.state.json = {
        items,
    };

    ctx.state.data = {
        title: $('channel > title').text(),
        link: $('channel > link').text(),
        description: $('channel > description').text(),
    };
};
