const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm';
    const response = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('.picnews_cont li');

    ctx.state.data = {
        title: '广州大学研究生院',
        link,
        description: '广州大学研招网通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('span a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(a.text(), 'YYYY-MM-DD'),
                };
            }),
    };
};
