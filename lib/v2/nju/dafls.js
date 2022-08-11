const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category_dict = {
        tzgg: '通知公告',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async (c) => {
            const response = await got(`https://dafls.nju.edu.cn/13167/list.htm`);

            const data = response.data;
            const $ = cheerio.load(data);
            const list = $('#article97');

            // only read first page
            return Promise.resolve(
                list.map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').last().text(),
                        link: 'https://dafls.nju.edu.cn' + item.find('a').attr('href'),
                        pubDate: timezone(parseDate(item.find('span').last().text(), 'YYYY-MM-DD'), +8),
                        category: c,
                    };
                })
            );
        })
    );

    ctx.state.data = {
        title: '大外部-通知公告',
        link: 'https://dafls.nju.edu.cn/13167/list.htm',
        item: [...items[0]],
    };
};
