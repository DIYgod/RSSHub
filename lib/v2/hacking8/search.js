const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://i.hacking8.com';
    const currentUrl = `${rootUrl}/search/?q=${keyword}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('div.media')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.link a');

            return {
                title: a.text(),
                link: new URL(a.attr('href'), rootUrl).href,
                description: item.find('div.media-body pre').text(),
                pubDate: timezone(parseDate(item.parent().parent().find('td').first().text(), 'YYYY年M月D日 HH:mm'), +8),
                category: item
                    .parent()
                    .parent()
                    .find('span.label')
                    .toArray()
                    .map((l) => $(l).text()),
            };
        });

    ctx.state.data = {
        title: `Hacking8 安全信息流 - ${$('title')
            .text()
            .replace(/总数:\d+/g, '')
            .trim()}`,
        link: currentUrl,
        item: items,
    };
};
