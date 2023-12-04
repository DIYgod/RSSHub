const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const rootUrl = 'https://www.verse.com.tw/articles';
    const currentUrl = category ? `${rootUrl}/${category}/` : rootUrl;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const items = await Promise.all(
        $('.templateA__list .templateA__listTitle a')
            .get()
            .map((item) => {
                item = $(item);
                const link = item.attr('href');
                return ctx.cache.tryGet(link, async () => {
                    const response = await got(link);
                    const $ = cheerio.load(response.data);

                    return {
                        title: $('title').text(),
                        author: $('#__author').first().text(),
                        description: $('.article__template').html(),
                        category: $('.article__infoType .category a')
                            .toArray()
                            .map((item) => $(item).text()),
                        pubDate: timezone(parseDate($('.article__data').text(), '日期 YYYY/MM/DD'), +8),
                        link,
                    };
                });
            })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').attr('content'),
        item: items,
    };
};
