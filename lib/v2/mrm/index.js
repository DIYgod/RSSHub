const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = 'zonghezixun3' } = ctx.params;
    const baseUrl = 'http://www.mrm.com.cn';
    const link = `${baseUrl}/${category}.html`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('#datalist_wap .li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text().trim(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('.d').text(), 'YYYY.MM.DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);

                item.description = $('.article-cont').html();
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
