const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const host = 'https://guangdiu.com';

module.exports = async (ctx) => {
    const query = ctx.params.query ?? '';
    const url = `${host}/cheaps.php${query ? `?${query}` : ''}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('div.cheapitem.rightborder')
        .map((_index, item) => ({
            title: $(item).find('div.cheaptitle').text().trim() + $(item).find('a.cheappriceword').text(),
            link: $(item).find('a.cheappriceword').attr('href'),
            description: $(item).find('div.cheapimga').html(),
            pubDate: parseRelativeDate($(item).find('span.cheapaddtimeword').text()),
        }))
        .get();

    ctx.state.data = {
        title: `逛丢 - 九块九`,
        link: url,
        item: items,
    };
};
