const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category_dict = {
        cgxx: '采购信息',
        cjgg: '成交公告',
        cfgg: '处罚公告',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async (c) => {
            const response = await got(`https://jjc.nju.edu.cn/${c}/list.htm`);

            const data = response.data;
            const $ = cheerio.load(data);
            const list = $('#wp_news_w6').children().children().children();

            // only read first page
            return Promise.resolve(
                list.map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.find('a').attr('title'),
                        link: 'https://jjc.nju.edu.cn' + item.find('a').attr('href'),
                        pubDate: timezone(parseDate(item.find('td').last().text(), 'YYYY-MM-DD'), +8),
                        category: category_dict[c],
                    };
                })
            );
        })
    );

    ctx.state.data = {
        title: `南京大学基建处`,
        link: 'https://jjc.nju.edu.cn/main.htm',
        item: [...items[0], ...items[1], ...items[2]],
    };
};
