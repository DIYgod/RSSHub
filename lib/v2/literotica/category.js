const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const rootUrl = 'https://www.literotica.com';
    const currentUrl = `${rootUrl}/c/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.b-slb-item')
        .map((_, item) => {
            item = $(item);

            const a = item.find('h3 a');

            return {
                title: a.text(),
                link: a.attr('href'),
                author: item.find('.b-user-info-name').text(),
                pubDate: parseDate(item.find('.b-slib-date').text(), 'MM/DD/YY'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.aa_ht').html();

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
