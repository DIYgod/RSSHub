const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.uisdc.com/news';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    $('.num').remove();

    const items = $('.oneimg')
        .map((_, item) => {
            item = $(item);
            const description = item.find('.item-content').html();
            const date = description.match(/[db|DB]-(\d{8})-\d{1}./)[1];
            return {
                description,
                link: rootUrl,
                title: item.find('h3').text(),
                pubDate: new Date(`${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
