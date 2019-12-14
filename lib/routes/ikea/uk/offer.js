const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.ikea.com/gb/en/ikea-family/discounts/';

    const items = [];

    const loadProductsOnPage = (data) => {
        const $ = cheerio.load(data);
        const products = $('.product-compact').get();

        if (products.length > 0) {
            for (const p of products) {
                let title =
                    $(p)
                        .find('.product-compact__name')
                        .text() + ' ';

                title +=
                    $(p)
                        .find('.product-compact__type')
                        .text()
                        .trim() + ' ';

                title += `[${$(p)
                    .find('.product-compact__comparable-price-element')
                    .text()} ▶️ ${$(p)
                    .find('.product-compact__price.product-compact__price--family')
                    .text()}]`;

                const link = $(p)
                    .find('.product-compact__spacer > a')
                    .attr('href');

                items.push({
                    title,
                    description: `<img src='${$(p)
                        .find('.range-image-claim-height > img')
                        .attr('src')}'>`,
                    link,
                });
            }
        }
    };

    const response = await got.get(link);

    loadProductsOnPage(response.data);

    const $ = cheerio.load(response.data);
    const list = $('.text.component a')
        .get()
        .map((e) => $(e).attr('href'));

    if (list.length > 0) {
        await Promise.all(
            list.map(async (url) => {
                const response = await got.get(url);
                loadProductsOnPage(response.data);
            })
        );
    }

    ctx.state.data = {
        title: 'IKEA UK - Offers',
        link,
        description: 'Offers by IKEA UK.',
        item: items,
    };
};
