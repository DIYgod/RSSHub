const got = require('@/utils/got');
const cheerio = require('cheerio');

const link = 'https://www.economist.com/the-world-in-brief';

module.exports = async (ctx) => {
    const response = await got(link);
    const $ = cheerio.load(response.data);

    const gobbets = $('._gobbets ._gobbet p')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                description: item.html(),
            };
        });

    const articles = $('._articles ._article')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h3').text();
            item.find('h3').remove();
            return {
                title,
                description: item.html(),
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        link,
        description: $('meta[property="og:description"]').attr('content'),
        item: [...gobbets, ...articles],
    };
};
