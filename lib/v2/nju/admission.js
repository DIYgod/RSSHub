const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category_dict = {
        tzgg: '通知公告',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async () => {
            const response = await got(`https://admission.nju.edu.cn/tzgg`);

            const data = response.data;
            const $ = cheerio.load(data);
            let script = $('ul').find('script');
            script = script['1'].children[0].data;

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
                }))
            );
        })
    );

    ctx.state.data = {
        title: '本科迎新-通知公告',
        link: 'https://admission.nju.edu.cn/tzgg',
        item: items[0],
    };
};
