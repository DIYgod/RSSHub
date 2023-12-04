const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { type = 'cameras' } = ctx.params;

    const response = await got(`${baseUrl}/${type}/reviews.php`);
    const $ = cheerio.load(response.data);

    const list = $('.col-md-left .title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: new URL(item.attr('href'), response.url).href,
            };
        });

    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: $('head title').text(),
        link: response.url,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
};
