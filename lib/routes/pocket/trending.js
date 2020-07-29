const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://getpocket.com/explore/trending';

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('.item').toArray();

    ctx.state.data = {
        title: 'Trending on Pocket',
        description: 'Top Articles and Videos about Trending on Pocket',
        link: url,
        item: list.map((item) => {
            item = $(item);
            return {
                title: item.find('.title').text(),
                author: item.find('.domain > a').text(),
                description: `<p>${item.find('.excerpt').text()}</p><img src="${item.find('.item_image').attr('data-thumburl')}" />`,
                link: item.find('.item_link').attr('data-saveurl'),
            };
        }),
    };
};
