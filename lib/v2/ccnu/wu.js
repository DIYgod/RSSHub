const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'http://uowji.ccnu.edu.cn/tzgg.htm';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.zy-mainxrx li');

    ctx.state.data = {
        title: '华中师范大学伍论贡学院',
        link,
        description: '华中师范大学伍论贡学院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('small').text(), 'YYYY-MM-DD'),
                };
            }),
    };
};
