const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = `https://zhiyou.smzdm.com/member/${ctx.params.uid}/baoliao/`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const title = $('.info-stuff-nickname').text();

    const list = $('.pandect-content-stuff')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.pandect-content-title a').text(),
                link: item.find('.pandect-content-title a').attr('href'),
                pubDate: timezone(parseDate(item.find('.pandect-content-time').text(), ['YYYY-MM-DD', 'MM-DD HH:mm']), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.description = $('article.txt-detail').html();
                item.pubDate = timezone(parseDate($('.time').first().text().trim().replace('更新时间：', '')), 8);
                item.author = title;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${title}的爆料 - 什么值得买`,
        link,
        item: out,
    };
};
