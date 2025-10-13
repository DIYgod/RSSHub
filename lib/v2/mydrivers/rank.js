const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, getInfo, processItems } = require('./util');

module.exports = async (ctx) => {
    const { range = '0' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const currentUrl = new URL('newsclass.aspx?tid=1001', rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx?ac=rank&tid=${range}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = cheerio.load(response);

    let items = $('a')
        .toArray()
        .filter((item) => /\/(\d+)\.html?/.test($(item).prop('href')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: new URL(link, rootUrl).href,
                guid: link.match(/\/(\d+)\.html?/)[1],
            };
        });

    items = await processItems(items, ctx.cache.tryGet);

    ctx.state.data = {
        item: items,
        ...(await getInfo(currentUrl, ctx.cache.tryGet, parseInt(range, 10))),
    };
};
