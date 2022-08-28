const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    ctx.path = ctx.path.replace(/^\/cnnic/g, '');

    const rootUrl = 'http://www.cnnic.net.cn';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '/gywm/xwzx/rdxw/20172017_7086/' : `${ctx.path}/`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.link a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 12)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.TRS_Editor').html();
                item.pubDate = timezone(parseDate(content('.info .text span').first().text(), 'YYYY年MM月DD日 HH:mm'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
