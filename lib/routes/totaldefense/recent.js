const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.totaldefense.com/security-blog/category/security-tip-of-the-day/`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div .post-row');

    ctx.state.data = {
        link: 'https://www.totaldefense.com/security-blog/category/security-tip-of-the-day/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('h4').text(),
                        description: item.find('p').text(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
