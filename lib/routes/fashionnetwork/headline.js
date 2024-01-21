const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const country = ctx.params.country || 'ww';
    if (!isValidHost(country)) {
        throw new Error('Invalid country');
    }

    const rootUrl = `https://${country}.fashionnetwork.com`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.point-carousel__item')
        .slice(5, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('.family-title a');

            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: Date.parse(item.find('.time-ago').attr('data-value')),
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

                content('.newsTitle, .ads').remove();

                item.description = content('div[itemprop="text"]').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.category-label').eq(0).text()} - FashionNetwork`,
        link: rootUrl,
        item: items,
    };
};
