const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.zhibo8.cc';
    const { category = 'nba' } = ctx.params;
    const link = `${rootUrl}/${category}/luxiang.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const list = $('.box')
        .toArray()
        .flatMap((item) => {
            item = $(item);
            const dateStr = item.find('h2').text().split(' ')[0];
            return item
                .find('a')
                .toArray()
                .map((item) => {
                    const href = $(item).attr('href');
                    return {
                        title: `${item.previousSibling.data.replace(' | ', '')} ${$(item).text()}`,
                        link: `${rootUrl}${href}`,
                        pubDate: timezone(parseDate(`${href.replace(`/${category}/`, '').substring(0, 4)} ${dateStr}`, 'YYYY M月D日'), +8),
                    };
                });
        });

    ctx.state.data = {
        title: $('head title').text(),
        link,
        image: 'https://www.zhibo8.cc/favicon.ico',
        item: list,
    };
};
