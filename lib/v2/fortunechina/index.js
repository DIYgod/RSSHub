const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://www.fortunechina.com';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.main')
        .find('h3 a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : `${currentUrl}/${item.attr('href')}`,
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

                const spans = content('.mod-info span').text();
                let matches = spans.match(/(\d{4}-\d{2}-\d{2})/);
                if (matches) {
                    item.pubDate = parseDate(matches[1]);
                } else {
                    matches = spans.match(/(\d+小时前)/);
                    if (matches) {
                        item.pubDate = parseRelativeDate(matches[1]);
                    }
                }

                item.author = content('.name').text();

                content('.mod-info, .title, .eval-zan, .eval-pic, .sae-more, .ugo-kol, .word-text .word-box .word-cn').remove();

                item.description = content('#articleContent, .eval-desc').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: category ? $('title').text() : '财富中文网',
        link: currentUrl,
        item: items,
    };
};
