const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const store = ctx.params.store;

    const rootUrl = 'https://www.shopback.com.tw';
    const currentUrl = `${rootUrl}/${store}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('table').remove();

    const items = $('div[data-content-name]')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('data-content-name'),
                author: item.attr('data-content-merchant'),
                description: `<p>${item.find('.mb-3').text()}</p>`,
                link: `${rootUrl}/login?redirect=/redirect/alink/${item.attr('data-content-id')}`,
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('h1').text()} - ShopBack`,
        link: currentUrl,
        item: items,
    };
};
