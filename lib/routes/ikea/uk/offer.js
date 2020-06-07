const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.ikea.com/gb/en/ikea-family/discounts/';

    const items = [];

    const loadProductsOnPage = (data) => {
        const $ = cheerio.load(data);
        const products = $('.range-revamp-product-compact').get();

        if (products.length > 0) {
            for (const p of products) {
                const price = $(p).find('.range-revamp-compact-price-package__price-wrapper').text();

                if (!price) {
                    continue;
                }

                let title = $(p).find('.range-revamp-header-section__title--small').text() + ' ';

                title += $(p).find('.range-revamp-header-section__description-text').text().trim() + ' ';

                const previous = $(p).find('.range-revamp-compact-price-package__previous-price-text').next('span').text();

                title += `[${previous} ▶️ ${price}]`;

                const link = $(p).find('.range-revamp-product-compact__bottom-wrapper > a').attr('href');

                items.push({
                    title,
                    description: `<img src='${$($(p).find('.range-revamp-aspect-ratio-image__image')[1]).attr('data-src')}'>`,
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
