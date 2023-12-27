const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.playstation.com/en-sg/ps-plus/whats-new/';

    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const list = $('.cmp-experiencefragment--your-latest-monthly-games .box')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                description: `<img src="${item.find('.media-block__img source').attr('srcset')}" />${item.find('h3 + p').text()}`,
                link: item.find('.button a').attr('href'),
            };
        });

    ctx.state.data = {
        title: 'PlayStation Plus Latest Monthly Games',
        link: baseUrl,
        item: list,
    };
};
