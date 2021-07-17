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
        title: 'Security Tip of the Day',
        link: 'https://www.totaldefense.com/security-blog/category/security-tip-of-the-day/',
        description: 'Daily tips to create awareness of cyber threats and empower Total Defense users to be safer and more secure online.',
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
