const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://bookfere.com/category/' + ctx.params.category;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('main div div section');

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = item.find('time').attr('datetime');
                    const pubDate = parseDate(date);
                    return {
                        title: item.find('h2 a').text(),
                        link: item.find('h2 a').attr('href'),
                        pubDate,
                        description: item.find('p').text(),
                    };
                })
                .get(),
    };
};
