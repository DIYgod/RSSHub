const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const baseUrl = 'https://www.ncwu.edu.cn/xxtz.htm';

module.exports = async (ctx) => {
    const response = await got(baseUrl);

    const $ = cheerio.load(response.data);
    const list = $('div.news-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: `「` + item.find('a.dw').text() + `」` + item.find('a.dw').next().text(),
                description: item.find('div.detail').text(),
                pubDate: parseDate(item.find('div.month').text() + '-' + item.find('div.day').text(), 'YYYY-MM-DD'),
                link: item.find('a.dw').next().attr('href'),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: baseUrl,
        item: list,
    };
};
