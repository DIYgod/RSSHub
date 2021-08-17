const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'http://www.wzu.edu.cn/index/wdxw.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#News-sidebar-b-nav').find('li');

    ctx.state.data = {
        title: '温大新闻',
        link,
        description: '温州大学',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const a1 = item.find('li a');
                    return { title: a1.attr('title'), description: a1.attr('title'), pubDate: parseDate(item.find('li samp').text(), 'YYYY-MM-DD'), link: a1.attr('href') };
                })
                .get(),
    };
};
