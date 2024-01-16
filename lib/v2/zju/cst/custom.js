const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

async function getPage(id) {
    const res = await got({
        method: 'get',
        url: `http://www.cst.zju.edu.cn/${id}/list.htm`,
    });
    const $ = cheerio.load(res.data);
    const content = $('.lm_new ul li');

    return (
        content &&
        content
            .map((index, item) => {
                item = $(item);

                const title = item.find('a').text();
                const pubDate = parseDate(item.find('.fr').text());
                const link = item.find('a').attr('href');

                return {
                    title,
                    pubDate,
                    link,
                };
            })
            .get()
    );
}

module.exports = async (ctx) => {
    const id = ctx.params.id.split('+');
    const tasks = id.map((id) => getPage(id));
    const results = await Promise.all(tasks);
    let items = [];
    for (const result of results) {
        items = [...items, ...result];
    }

    ctx.state.data = {
        title: '浙江大学软件学院通知',
        link: 'http://www.cst.zju.edu.cn/',
        item: items,
    };
};
