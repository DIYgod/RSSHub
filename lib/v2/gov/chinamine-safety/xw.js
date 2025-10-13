const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { category = 'yjglbyw' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`xw/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.center_display_right table tbody tr td a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.parent().find('span').text()), +8),
            };
        });

    items = await processItems(items, ctx.cache.tryGet);

    ctx.state.data = {
        item: items,
        ...fetchData($, currentUrl),
    };
};
