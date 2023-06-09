const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.lib.bnu.edu.cn';
    const { category = 'zydt' } = ctx.params;
    const link = `${baseUrl}/${category}/index.htm`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('.view-content .item-list li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `${baseUrl}/${category}/${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span > span').eq(1).text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('#block-system-main .content .content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link,
        item: items,
    };
};
