const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://bbs.zhibo8.cc/forum/list/?fid=${id}`;

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const title = $('div.intro > h2').text();
    const list = $('table.topic-list > tbody:nth-child(3) > tr');

    const out = await Promise.all(
        list.toArray().map((item) => {
            item = $(item);
            const a = item.find('td:nth-child(1) > a:nth-child(2)');
            const link = 'https://bbs.zhibo8.cc' + a.attr('href');
            return ctx.cache.tryGet(link, async () => {
                const title = a.text();
                const author = item.find('td:nth-child(2) cite a').text();
                const date = item.find('td:nth-child(2) em').text();

                const response = await got(link);
                const $ = cheerio.load(response.data);
                const description = $('.detail_ent').html();

                return {
                    title,
                    description,
                    author,
                    link,
                    pubDate: timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), +8),
                };
            });
        })
    );

    ctx.state.data = {
        title: `${title}—直播吧`,
        link,
        item: out,
    };
};
