const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://bbs.zhibo8.cc/forum/list/?fid=${id}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('div.intro > h2').text();
    const list = $('table.topic-list > tbody:nth-child(3) > tr');

    const out = await Promise.all(
        list
            .map(async (_, item) => {
                item = $(item);
                const title = item.find('td:nth-child(1) > a:nth-child(2)').text();
                const author = item.find('td:nth-child(2) cite a').text();
                const date = item.find('td:nth-child(2) em').text();
                const link = 'https://bbs.zhibo8.cc' + item.find('td:nth-child(1) > a:nth-child(2)').attr('href');

                const single = {
                    title,
                    author,
                    link,
                    pubDate: timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), +8),
                };

                single.description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('.detail_ent').html();
                });
                return single;
            })
            .get()
    );

    ctx.state.data = {
        title: `${title}—直播吧`,
        link,
        item: out,
    };
};
