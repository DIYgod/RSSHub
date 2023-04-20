const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://yzb.scau.edu.cn/2136/list1.htm';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('#wp_news_w25 tr');

    ctx.state.data = {
        title: '华南农业大学研究生院',
        link,
        description: '华南农业大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    pubDate: parseDate(item.find('td').eq(3).text(), 'YYYY/MM/DD'),
                };
            }),
    };
};
