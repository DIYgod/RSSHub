const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://gszs.hust.edu.cn/zsxx/ggtz.htm';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.main_conRCb li');

    ctx.state.data = {
        title: '华中科技大学研究生院',
        link,
        description: '华中科技大学研究生调剂信息',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    };
};
