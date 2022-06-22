const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://supchina.com';
    const currentUrl = `${rootUrl}/feed/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('item')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                guid: item.find('guid').text(),
                title: item.find('title').text(),
                link: item.find('guid').text(),
                author: item
                    .find('dc\\:creator')
                    .html()
                    .match(/CDATA\[(.*?)\]/)[1],
                category: item
                    .find('category')
                    .toArray()
                    .map(
                        (c) =>
                            $(c)
                                .html()
                                .match(/CDATA\[(.*?)\]/)[1]
                    ),
                pubDate: parseDate(item.find('pubDate').text()),
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

                content('.aspect-spacer, .post-recs, .author-bio').remove();

                item.description = content('.post__main').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').first().text(),
        link: rootUrl,
        item: items,
    };
};
