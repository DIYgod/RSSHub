const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://good.news';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.content-structure')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h4 a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.content-left').text()),
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

                item.description = content('div[contentscore]').html();

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
