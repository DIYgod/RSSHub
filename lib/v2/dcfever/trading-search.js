const got = require('@/utils/got');
const cheerio = require('cheerio');
// const { parseRelativeDate } = require('@/utils/parse-date');
const { baseUrl, parseTradeItem } = require('./utils');

module.exports = async (ctx) => {
    const { keyword, mainCat } = ctx.params;

    const response = await got(`${baseUrl}/trading/search.php`, {
        searchParams: {
            keyword,
            type: 'all',
            main_cat: mainCat,
            form_action: 'search_action',
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('.item_list li a')
        .toArray()
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
