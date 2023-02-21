const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'http://fdy.bnu.edu.cn';
    const { path = 'tzgg' } = ctx.params;
    const link = `${baseUrl}/${path}/index.htm`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $('.listconrl li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), link).href,
                pubDate: parseDate(item.find('.news-dates').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.listconrc-newszw').html();
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
