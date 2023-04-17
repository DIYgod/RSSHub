const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://gschool.ecust.edu.cn';
    const link = `${baseUrl}/12753/list.htm`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('#wp_news_w6 li');

    ctx.state.data = {
        title: '华东理工大学研究生院',
        link,
        description: '华东理工大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: `${baseUrl}${item.find('a').attr('href')}`,
                    pubDate: parseDate(item.find('.news_meta').text()),
                };
            }),
    };
};
