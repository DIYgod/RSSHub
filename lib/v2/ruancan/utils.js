const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx, currentUrl) => {
    const rootUrl = 'https://www.ruancan.com';
    currentUrl = `${rootUrl}${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.item-title a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                content('.entry-copyright').remove();

                content('.entry-content div').each(function () {
                    if (/^ruanc-\d+/.test(content(this).attr('id'))) {
                        content(this).remove();
                    }
                });

                content('figure').each(function () {
                    content(this).html(`<img src="${content(this).find('a').attr('href')}">`);
                });

                item.description = content('.entry-content').html();
                item.category = content('.entry-info a[rel="category tag"]')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('.entry-info .entry-date').attr('datetime'));

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
