const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const websiteUrl = 'https://military.china.com/news/';
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = cheerio.load(data);
    const commonList = $('.item_list li');
    ctx.state.data = {
        title: '中华网-军事新闻',
        link: 'https://military.china.com/news/',
        item:
            commonList &&
            commonList
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('h3.item_title').text(),
                        author: '中华网军事',
                        category: '中华网军事',
                        pubDate: parseDate(item.find('em.item_time').text()),
                        description: item.find('.item_source').text(),
                        link: item.find('h3.item_title a').attr('href'),
                    };
                })
                .get(),
    };
};
