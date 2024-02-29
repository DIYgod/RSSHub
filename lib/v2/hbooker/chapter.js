const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = Number.parseInt(ctx.query.limit) || 10;

    const baseUrl = 'https://www.hbooker.com';

    const { data: response } = await got(`${baseUrl}/book/${id}?arr_reverse=1`);
    const $ = cheerio.load(response);

    const list = $('div.book-chapter-list ul li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const rawDate = $('div.read-hd p span').eq(2).text();
                item.pubDate = timezone(parseDate(rawDate.replace('更新时间：', '')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `欢乐书客 ${$('div.book-title h1').text()}`,
        link: `${baseUrl}/book/${id}`,
        description: $('div.book-desc').text(),
        image: $('div.book-cover img').attr('src'),
        item: items,
    };
};
