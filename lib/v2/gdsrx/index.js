const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id = '10' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 15;

    const rootUrl = 'http://www.gdsrx.org.cn';
    const currentUrl = new URL(`portal/list/index/id/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('a.xn-item, a.t-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.xn-d, div.t-e').text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.find('div.xn-time, div.t-f').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                const categories = content('a.nav-a')
                    .slice(1)
                    .toArray()
                    .map((c) => content(c).text());

                item.title = categories.pop() || content('div.u-c').text();
                item.description = content('div.u-f').html();
                item.author = content('.author').text();
                item.category = categories;
                item.pubDate = parseDate(content('div.u-d').text());

                return item;
            })
        )
    );

    const author = $('title').text();
    const image = $('a.h-g img').prop('src');
    const icon = new URL('favicon.ico', rootUrl).href;
    const subtitle = $('a.nav-a')
        .toArray()
        .map((c) => $(c).text())
        .pop();

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
};
