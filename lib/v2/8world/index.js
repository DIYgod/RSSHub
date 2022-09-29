const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const path = ctx.path === '/' ? '/realtime' : ctx.path;

    const rootUrl = 'https://www.8world.com';
    const currentUrl = `${rootUrl}${path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('div[data-column="Two-Third"] .article-title .article-link')
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

                item.description = content('.text-long').html();
                item.title = content('meta[name="cXenseParse:mdc-title"]').attr('content');
                item.author = content('meta[name="cXenseParse:author"]').attr('content');
                item.pubDate = parseDate(content('meta[name="cXenseParse:recs:publishtime"]').attr('content'));
                item.category = content('meta[name="cXenseParse:mdc-keywords"]')
                    .toArray()
                    .map((keyword) => content(keyword).attr('content'));

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
