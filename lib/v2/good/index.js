const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://good.news';

    const response = await got(rootUrl);

    const $ = cheerio.load(response.data);

    let items = $('.content-structure')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item
                    .find('h4')
                    .text()
                    .replace(/^\s+\d{1,2}\./, ''),
                link: item.parent().attr('href'),
                pubDate: parseDate(item.find('.content-left').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = cheerio.load(detailResponse.data);

                content('img').each((_, img) => {
                    if (img.attribs['data-src']) {
                        img.attribs.src = img.attribs['data-src'].replace('-cdsb.onlycompress', '');
                        delete img.attribs['data-src'];
                    }
                });

                item.description = content('[contentscore]').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'good.news - 今日要闻',
        link: rootUrl,
        item: items,
    };
};
