const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://gs.xjtu.edu.cn/tzgg.htm';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.list_right_con ul li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), 'http://gs.xjtu.edu.cn/').href,
                pubDate: parseDate(item.find('span.time').text()),
            };
        })
        .get();

    ctx.state.data = {
        title: '西安交通大学研究生院 - 通知公告',
        link: rootUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got(item.link);
                    const content = cheerio.load(res.data);
                    item.description = content('#vsb_content').html() + (content('form ul').length > 0 ? content('form ul').html() : '');
                    return item;
                })
            )
        ),
    };
};
