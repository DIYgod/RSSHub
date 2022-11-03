const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'news';

    const rootUrl = 'https://finviz.com';
    const currentUrl = `${rootUrl}/news.ashx`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.table-fixed')
        .eq(category === 'blog' ? 1 : 0)
        .find('.nn')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.nn-tab-link');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate(item.find('.nn-date').text(), ['MMM-DD', 'HH:mmA']), -4),
                description:
                    item
                        .find('td[data-boxover]')
                        .attr('data-boxover')
                        ?.match(/<td class='news_tooltip-tab'>([\s\S]*)<\/td>/)[1] ?? '',
            };
        });

    ctx.state.data = {
        title: `finviz - ${category}`,
        link: currentUrl,
        item: items,
    };
};
