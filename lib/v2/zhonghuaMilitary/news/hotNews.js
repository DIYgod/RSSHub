const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const websiteUrl = 'https://military.china.com/news/';
    const response = await got({
        method: 'get',
        url: websiteUrl,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const commonList = $('.listItem');

    ctx.state.data = {
        title: '中华网-军事新闻',
        link: 'https://military.china.com/news/',
        item:
            commonList &&
            commonList
                .map((index, item) => {
                    item = $(item);
                    return {
                        pubDate: item.find('.time').text(),
                        title: item.find('.tit a').text(),
                        description: item.find('.tag').text(),
                        link: item.find('.tit a').attr('href'),
                    };
                })
                .get(),
    };
};
