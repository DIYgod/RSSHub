const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

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
                title: a.text(),
                link: url.resolve('http://gs.xjtu.edu.cn/', a.attr('href')),
                pubDate: new Date(item.find('span.time').text()).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '西安交通大学研究生院 - 通知公告',
        link: rootUrl,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const res = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(res.data);
                        item.description = content('#vsb_content').html();
                        return item;
                    })
            )
        ),
    };
};
