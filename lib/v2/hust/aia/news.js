const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://aia.hust.edu.cn/xyxw.htm';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.list li');

    ctx.state.data = {
        title: '华科人工智能和自动化学院新闻',
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a h2').text(),
                    description: item.find('a div').text() || '华科人工智能和自动化学院新闻',
                    pubDate: parseDate(item.find('.date3').text(), 'DDYYYY-MM'),
                    link: new URL(item.find('a').attr('href'), link).href,
                };
            }),
    };
};
