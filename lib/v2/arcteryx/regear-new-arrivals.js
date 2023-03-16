const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const host = 'https://www.regear.arcteryx.com';
function getUSDPrice(number) {
    return (number / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
module.exports = async (ctx) => {
    const url = `${host}/shop/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const contents = $('script:contains("window.__PRELOADED_STATE__")').text();
    const regex = /{.*}/;
    let items = JSON.parse(contents.match(regex)[0]).shop.items;
    items = items.filter((item) => item.availableSizes.length !== 0);

    const list = items.map((item) => {
        const data = {};
        data.title = item.displayTitle;
        data.link = item.pdpLink.url;
        data.imgUrl = JSON.parse(item.imageUrls).front;
        data.availableSizes = item.availableSizes;
        data.color = item.color;
        data.originalPrice = getUSDPrice(item.originalPrice);
        if (item.priceRange[0] === item.priceRange[1]) {
            data.regearPrice = getUSDPrice(item.priceRange[0]);
        } else {
            data.regearPrice = `${getUSDPrice(item.priceRange[0])} - ${getUSDPrice(item.priceRange[1])}`;
        }
        data.description = art(path.join(__dirname, 'templates/regear-product-description.art'), {
            data,
        });
        return data;
    });

    ctx.state.data = {
        title: 'Arcteryx - Regear - New Arrivals',
        link: url,
        description: 'Arcteryx - Regear - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            link: item.link,
            description: item.description,
        })),
    };
};
