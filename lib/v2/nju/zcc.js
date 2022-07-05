const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category_dict = {
        gyfytdglk: '公用房与土地管理科',
        zfglk: '住房管理科',
        xxzhk: '信息综合科',
        czcjk: '出租出借管理科',
        gyzcglk: '国有资产管理科',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async (c) => {
            const response = await got(`https://zcc.nju.edu.cn/tzgg/${c}/index.html`);

            const data = response.data;
            const $ = cheerio.load(data);
            let script = $('ul.clearfix').find('script');
            script = script['2'].children[0].data;

            const start = script.indexOf('[');
            const end = script.lastIndexOf(']');
            const t = JSON.parse(script.substring(start, end + 1));

            // only read first page
            return Promise.resolve(
                t[0].infolist.map((item) => ({
                    title: item.title,
                    description: item.summary,
                    link: item.url,
                    author: item.username,
                    pubDate: parseDate(item.releasetime, 'x'),
                    category: category_dict[c],
                }))
            );
        })
    );

    ctx.state.data = {
        title: '资产管理处-通知公告',
        link: 'https://zcc.nju.edu.cn/tzgg/index.html',
        item: [...items[0], ...items[1], ...items[2], ...items[3], ...items[4]],
    };
};
