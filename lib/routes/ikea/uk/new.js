const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.ikea.com/gb/en/news/product-news-gallery/';

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.card__link')
        .get()
        .map((e) => $(e).attr('href'));
    const items = [];

    await Promise.all(
        list.map(async (sectionUrl) => {
            const response = await got.get(sectionUrl);

            const $ = cheerio.load(response.data);

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
                        .find('.product-compact__price')
                        .text()
                        .trim()}]`;

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
            return Promise.resolve();
        })
    );

    ctx.state.data = {
        title: 'IKEA UK - New Products',
        link,
        description: 'New products released by IKEA UK.',
        item: items,
    };
};
