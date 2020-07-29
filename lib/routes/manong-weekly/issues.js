const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://weekly.manong.io/issues/';
    const response = await got({
        rejectUnauthorized: false,
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('.issue')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('a');
            const title = $link.text();
            const link = $link.attr('href');
            const description = elem.find('p').text();

            return {
                title,
                link,
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: '码农周刊',
        link: url,
        item: resultItem,
    };
};
