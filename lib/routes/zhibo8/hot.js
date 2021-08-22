const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://news.zhibo8.cc';
    const apiUrl = `https://m.zhibo8.cc/json/hot/24hours.htm`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.news.slice(0, 50).map((item) => ({
        title: item.title,
        link: `${rootUrl}${item.url}`,
        category: item.label.split(','),
        pubDate: timezone(parseDate(item.createtime), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(res.data);

                item.description = content('div.content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '24小时头条 - 直播吧',
        link: rootUrl,
        item: items,
    };
};
