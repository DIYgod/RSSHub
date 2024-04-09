const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://genetics.cas.cn/jixs/yg/';

    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const items = $('li.row.no-gutters.py-1')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const date = item.find('.col-news-date').first();
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: parseDate(date.text(), 'YYYY.MM.DD'),
            };
        });

    ctx.state.data = {
        title: 'IGDB - 学术活动',
        link: baseUrl,
        item: items,
    };
};
