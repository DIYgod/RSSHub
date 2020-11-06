const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://javascriptweekly.com/issues/latest');
    const $ = cheerio.load(response.data);

    const item = $('.desc a:first-child')
        .map((index, ele) => ({
            title: $(ele).text(),
            link: $(ele).attr('href'),
            author: $(ele).parents('p.desc').next('.name').text(),
            description: $(ele).parents('p.desc').html(),
        }))
        .get();

    ctx.state.data = {
        language: 'en-us',
        title: 'JavaScript Weekly',
        link: 'https://javascriptweekly.com/issues/latest',
        item,
    };
};
