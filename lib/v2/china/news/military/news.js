const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const websiteUrl = 'https://military.china.com/news/';
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = cheerio.load(data);
    const commonList = $('.listItem');

    ctx.state.data = {
        title: '中华网-军事新闻',
        link: 'https://military.china.com/news/',
        item:
            commonList &&
            commonList
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('.tit a').text(),
                        author: '中华网军事',
                        category: '中华网军事',
                        pubDate: parseDate(item.find('.time').text()),
                        description: item.find('.tag').text(),
                        link: item.find('.tit a').attr('href'),
                    };
                })
                .get(),
    };
};
