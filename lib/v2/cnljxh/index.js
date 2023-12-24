const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const defaultIds = {
    collect: '10039',
    date: '5575',
    info: '575',
    news: '10',
    price: '299',
};

module.exports = async (ctx) => {
    const { category = 'news', id = defaultIds.hasOwnProperty(category) ? defaultIds[category] : '10' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const rootUrl = 'http://www.cnljxh.com';
    const currentUrl = new URL(`${category}/?classid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.main_left ul li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') || item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.next().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('div.content_title h2').text() || item.title;
                item.description = content('div.content_div').html();
                item.enclosure_url = content('div.content_div embed').length === 0 ? undefined : new URL(content('div.content_div embed').prop('src'), currentUrl).href;
                item.enclosure_type = item.enclosure_url ? `application/${item.enclosure_url.split(/\./).pop()}` : undefined;

                return item;
            })
        )
    );

    const author = $('title').text();
    const subtitle = $('div.mianbao').contents().last().text().split(/>/).pop().trim() || $('div.mianbao a').last().text();
    const image = new URL($('div.logo a img').prop('src'), currentUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
};
