const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl, processItems, fetchData } = require('./util');

module.exports = async (ctx) => {
    const { category = 'fdzdgknr/tzgg' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`zfxxgk/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('ul#ogi-list li a, div#ogi-list dd a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.contents().first().text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.parent().find('span').text()),
            };
        });

    items = await processItems(items, ctx.cache.tryGet);

    ctx.state.data = {
        item: items,
        ...fetchData($, currentUrl),
    };
};
