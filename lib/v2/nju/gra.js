const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://grawww.nju.edu.cn/905/list1.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('li.list_item');

    ctx.state.data = {
        title: '研究生院-动态通知',
        link: 'https://grawww.nju.edu.cn/905/list1.htm',
        item: list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: 'https://grawww.nju.edu.cn' + item.find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('.Article_PublishDate').first().text(), 'YYYY-MM-DD'), +8),
                };
            })
            .get(),
    };
};
