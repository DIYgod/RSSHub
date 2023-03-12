const got = require('@/utils/got');
const cheerio = require('cheerio');
// const { parseRelativeDate } = require('@/utils/parse-date');
const { baseUrl, parseTradeItem } = require('./utils');

module.exports = async (ctx) => {
    const { id, order = 'new' } = ctx.params;

    const response = await got(`${baseUrl}/trading/listing.php`, {
        searchParams: {
            id,
            order,
            type: 'all',
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('.item_list li a')
        .toArray()
        .filter((item) => $(item).attr('href') !== '/documents/advertising.php')
        .map((item) => {
            item = $(item);
            item.find('.optional').remove();
            return {
                title: item.find('.trade_title').text(),
                link: new URL(item.attr('href'), response.url).href,
                author: item.find('.trade_info').text(),
            };
        });

    const items = await Promise.all(list.map((item) => parseTradeItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: $('head title').text(),
        link: response.url,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
};
