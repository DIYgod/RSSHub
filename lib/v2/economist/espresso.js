const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

const link = 'https://www.economist.com/the-world-in-brief';

module.exports = async (ctx) => {
    const $ = await ctx.cache.tryGet(
        link,
        async () => {
            const response = await got(link);
            return cheerio.load(response.data);
        },
        config.cache.routeExpire,
        false
    );

    const gobbets = $('._gobbets ._gobbet p')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                description: item.html(),
                link,
                guid: item.text(),
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
                link,
                guid: item.text(),
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        link,
        description: $('meta[property="og:description"]').attr('content'),
        item: [...gobbets, ...articles],
    };
};
