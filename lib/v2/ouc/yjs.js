const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://yz.ouc.edu.cn/5926/list.htm';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.wp_article_list li');

    ctx.state.data = {
        title: '中国海洋大学研究生院',
        link,
        description: '中国海洋大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('.Article_PublishDate').text()),
                };
            }),
    };
};
