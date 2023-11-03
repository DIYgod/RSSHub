const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml';
const sizeTitle = '农博士在行动-河北广播电视台';

module.exports = async (ctx) => {
    const response = await got(baseUrl);
    const $ = cheerio.load(response.data);

    // 获取当前页面的 list
    const list = $('.video_box .tv_items')
        .first()
        .children()
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const timeMatch = a.text().match(/\d+/);
            const timestr = timeMatch ? timeMatch[0] : '';

            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: `${baseUrl}/../${a.attr('href')}`,
                pubDate: timestr ? timezone(parseDate(timestr, 'YYYYMMDD'), +8) : null,
                author: '时间|' + timestr,
            };
        });

    ctx.state.data = {
        title: sizeTitle,
        link: baseUrl,
        description: '农博士在行动-河北广播电视台',
        item: list,
    };
};
