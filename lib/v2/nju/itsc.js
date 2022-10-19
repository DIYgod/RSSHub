const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category_dict = {
        tzgg: '通知公告',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async () => {
            const response = await got(`https://itsc.nju.edu.cn/tzgg/list.htm`);

            const data = response.data;
            const $ = cheerio.load(data);
            const tmp = $('.list2')[0].children;
            const infos = [];
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].children) {
                    infos.push(tmp[i]);
                }
            }

            // only read first page
            return Promise.resolve(
                infos.map((item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.find('a').attr('title'),
                        link: 'https://itsc.nju.edu.cn' + item.find('a').attr('href'),
                        pubDate: timezone(parseDate(item.find('td').last().text(), 'YYYY-MM-DD'), +8),
                        category: category_dict[0],
                    };
                })
            );
        })
    );

    ctx.state.data = {
        title: 'ITSC-公告通知',
        link: 'https://itsc.nju.edu.cn/tzgg/list.htm',
        item: items[0],
    };
};
