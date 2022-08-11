const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const products = ctx.params.products;
    const url = `https://${username}.gumroad.com/l/${products}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('section.product-content.product-content__row > header > h1').text();
    const userFullName = $('section.product-content.product-content__row > section.details > a').text();

    const item = [
        {
            title,
            link: url,
            description: art(path.join(__dirname, 'templates/products.art'), {
                img: response.data.match(/data-preview-url="(.*?)"/)[1],
                productsName: title,
                price: $('div.price').text(),
                desc: $('section.product-content.product-content__row > section:nth-child(3) > div').html(),
                stack: $('div.product-info').find('ul.stack').html(),
            }),
        },
    ];

    ctx.state.data = {
        link: url,
        title: `Gumroad - ${userFullName}/${title}`,
        item,
    };
};
