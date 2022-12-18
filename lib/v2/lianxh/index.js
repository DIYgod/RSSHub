const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://www.lianxh.cn';
    const currentUrl = `${rootUrl}/blogs${category ? `/${category}` : ''}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.news-title a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
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

                item.description = content('#nice').html();
                item.pubDate = parseDate(
                    content('.news-share')
                        .prev()
                        .find('span')
                        .first()
                        .text()
                        .match(/(\d+-\d+-\d+)/)[1],
                    'YYYY-MM-DD'
                );

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `连享会 - ${$('.actives').text()}`,
        link: currentUrl,
        item: items,
    };
};
