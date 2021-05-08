const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://www.au.edu.pk/`;
    const response = await got.get({ method: 'get', url: link });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.panel-body .info');
    const items = list
        .map((index, item) => {
            item = $(item);
            const itemlink = item.find('.heading a').attr('href');
            return {
                title: item.find('.heading a').text(),
                link: itemlink.startsWith('https') || itemlink.startsWith('http') ? itemlink : link + itemlink,
            };
        })
        .get();

    ctx.state.data = {
        title: 'Air University',
        url: link,
        description: 'News Notification for Air university',
        item: items,
    };
};
