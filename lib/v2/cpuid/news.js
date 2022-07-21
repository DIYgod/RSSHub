const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const newsUrl = 'https://www.cpuid.com/news.html';

module.exports = async (ctx) => {
    const response = await got(newsUrl);
    const $ = cheerio.load(response.data);

    const items = $('.block_100 .js-block-news')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.information a').text(),
                description: item.find('.description').html(),
                link: item.find('.information a').attr('href'),
                pubDate: parseDate(item.find('time[itemprop=dateCreated]').attr('datetime')),
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head description').attr('content'),
        link: newsUrl,
        image: $('link[rel=apple-touch-icon-precomposed]').attr('href'),
        item: items,
        language: $('html').attr('lang'),
    };
};
