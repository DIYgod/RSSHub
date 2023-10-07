const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'http://paulgraham.com';
    const currentUrl = new URL('articles.html', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('font a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                const description = content('font').first();

                item.title = content('title').text();
                item.description = description.html();
                item.pubDate = parseDate(description.contents().first().text(), 'MMMM YYYY');

                return item;
            })
        )
    );

    const author = 'Paul Graham';
    const title = $('title').text();
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title: `${author} - ${title}`,
        link: currentUrl,
        description: title,
        language: 'en',
        image: $(`img[alt="${title}"]`).prop('src'),
        icon,
        logo: icon,
        subtitle: title,
        author,
        allowEmpty: true,
    };
};
