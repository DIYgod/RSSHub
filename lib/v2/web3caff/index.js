const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const params = ctx.path === '/' ? '' : ctx.path;

    const rootUrl = 'https://web3caff.com';
    const currentUrl = `${rootUrl}${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list-grouped')
        .first()
        .find('.list-body')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.list-title');

            return {
                title: a.text(),
                link: a.attr('href'),
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

                content('.ss-inline-share-wrapper').remove();

                item.description = content('.post-content').html();
                item.author = content('.author-name .author-popup').text();
                item.category = content('a[rel="category tag"]')
                    .toArray()
                    .map((tag) => $(tag).text());
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

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
