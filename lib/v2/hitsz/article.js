const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const host = 'https://www.hitsz.edu.cn';
    const category = ctx.params.category ?? 'id-77';
    const link = `${host}/article/${category}.html`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const category_name = $('div.title_page').text().trim();

    const lists = $('.mainside_news ul li')
        .toArray()
        .map((el) => ({
            title: $('a', el).text().trim(),
            link: `${host}${$('a', el).attr('href')}`,
            pubDate: timezone(parseDate($('span[class=date]', el).text()), 8),
        }));

    const items = await Promise.all(
        lists.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);
                item.description = $('div.edittext').html().trim();
                item.pubDate = timezone(parseDate($('.item').first().text().replace('发布时间：', '')), 8);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '哈尔滨工业大学（深圳）-' + category_name,
        link,
        description: '哈尔滨工业大学（深圳）-' + category_name,
        item: items,
    };
};
