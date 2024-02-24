const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const ProcessFeed = (ctx, info, data) => {
    const title = info.title;
    const itemUrl = info.link;

    const $ = cheerio.load(data);

    const author = $('div.detail_title_02 > h4 > a:nth-child(2)').text().trim();

    const date_value = $('div.detail_title_02 > h4 ').text().trim();

    const description = $('div.detail_contect_01').html();

    const single = {
        title,
        link: itemUrl,
        description,
        author,
        pubDate: timezone(parseRelativeDate(date_value), 8),
    };
    ctx.cache.set(itemUrl, JSON.stringify(single));
    return Promise.resolve(single);
};

module.exports = {
    ProcessFeed,
};
