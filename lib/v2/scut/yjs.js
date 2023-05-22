const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www2.scut.edu.cn';
    const link = `${baseUrl}/graduate/14562/list.htm`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('#wp_news_w4 a');

    ctx.state.data = {
        title: '华南理工大学研究生院',
        link,
        description: '华南理工大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: `${baseUrl}${item.attr('href')}`,
                    pubDate: parseDate(item.find('span').text()),
                };
            }),
    };
};
