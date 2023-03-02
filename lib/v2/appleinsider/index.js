const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://appleinsider.com';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $(`${category === '' ? '#news-river ' : ''}.river`)
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item).find('a').first();

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

                content('#article-social').next().remove();
                content('#article-hero, #article-social').remove();
                content('.deals-widget').remove();

                item.title = content('.h1-adjust').text();
                item.author = content('.avatar-link a').attr('title');
                item.pubDate = parseDate(content('time').first().attr('datetime'));
                item.description = content('header').next('.row').html();

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
