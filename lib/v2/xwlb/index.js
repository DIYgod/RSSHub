const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const url = 'http://www.xwlb.com.cn/cctv.html';

    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const list = $('.block .post')
        .toArray()
        .map((item) => {
            item = $(item);
            const dateStr = item.find('.info .date').text();
            return {
                title: item.find('h2 a').text(),
                link: item.find('h2 a').attr('href'),
                pubDate: timezone(dateStr.includes('-') ? parseDate(dateStr, 'MM-DD') : parseRelativeDate(dateStr), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: res } = await got(item.link);
                const $ = cheerio.load(res);
                $('.adsbygoogle, #myFlash').remove();
                item.description = $('.single').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: out,
    };
};
