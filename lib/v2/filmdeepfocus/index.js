const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'page';

    const rootUrl = 'https://www.filmdeepfocus.com';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.summary-title-link')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                content('.image-block').each(function () {
                    content(this).html(`<img src="${content(this).find('img').attr('data-src')}">`);
                });

                item.description = content('.entry-content').html();
                item.author = content('meta[itemprop="publisher"]').attr('content');
                item.pubDate = parseDate(content('meta[itemprop="datePublished"]').attr('content'));

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
