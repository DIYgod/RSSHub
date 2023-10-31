const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://v.iqilu.com/nkpd/xcjf/index.html';
const sizeTitle = '乡村季风-山东广播电视台';

module.exports = async (ctx) => {
    const response = await got(baseUrl);
    const $ = cheerio.load(response.data);

    // 获取当前页面的 list
    const list = $('div#jmzhanshi1')
        .first()
        .children()
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const t = item.find(":contains('时间')").first().text();
            const timeMatch = t.match(/\d+-\d+-\d+/);
            const timestr = timeMatch ? timeMatch[0] : '';
            return {
                title: a.attr('title'),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: String(a.attr('href')),
                pubDate: timestr ? timezone(parseDate(timestr, 'YYYY-MM-DD'), +8) : null,
                author: '时间|' + timestr,
            };
        });

    ctx.state.data = {
        title: sizeTitle,
        link: baseUrl,
        description: '乡村季风-山东广播电视台',
        item: list,
    };
};
