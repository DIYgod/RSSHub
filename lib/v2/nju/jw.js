const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const type_dict = {
        ggtz: ['https://jw.nju.edu.cn/ggtz/list.htm', '公告通知'],
        jxdt: ['https://jw.nju.edu.cn/_t1143/24774/list.psp', '教学动态'],
    };
    const response = await got({
        method: 'get',
        url: type_dict[type][0],
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('li.news');

    ctx.state.data = {
        title: `本科生院-${type_dict[type][1]}`,
        link: type_dict[type][0],
        item: list
            .map((index, item) => {
                item = $(item);
                if (type === 'ggtz') {
                    return {
                        title: item.find('a').attr('title'),
                        category: item.find('div').first().text().split('，'),
                        link: 'https://jw.nju.edu.cn' + item.find('a').attr('href'),
                        pubDate: timezone(parseDate(item.find('.news_meta').first().text(), 'YYYY-MM-DD'), +8),
                    };
                } else {
                    return {
                        title: item.find('a').attr('title'),
                        link: 'https://jw.nju.edu.cn' + item.find('a').attr('href'),
                        pubDate: timezone(parseDate(item.find('.news_meta').first().text(), 'YYYY-MM-DD'), +8),
                    };
                }
            })
            .get(),
    };
};
