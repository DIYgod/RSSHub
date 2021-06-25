const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/16285/list.htm`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('.news_ul li');
    const items = list.map((_, item) => {
        item = $(item);
        return {
            title: item.find('.news_title a').attr('title'),
            description: item.find('.news_title a').attr('title'),
            link: item.find('.news_title a').attr('href'),
            pubDate: parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'),
        };
    }).get();

    ctx.state.data = {
        title: '华南理工大学电子与信息学院 - 新闻速递',
        link: url,
        item: items,
    };
};
