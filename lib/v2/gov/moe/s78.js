const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.moe.gov.cn';
    const { column } = ctx.params;
    const link = `${baseUrl}/s78/${column}/tongzhi/`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('#list li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), link).href,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('#moe-detail-page-set, #moeCode, .moe-detail-shuxing, h1').remove();
                item.description = $('.moe-detail-box').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('meta[name="ColumnType"]').attr('content')} - ${$('head title').text()}`,
        link,
        item: items,
    };
};
