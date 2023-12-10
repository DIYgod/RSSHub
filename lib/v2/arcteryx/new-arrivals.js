const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { generateRssData } = require('./utils');

module.exports = async (ctx) => {
    const { country, gender } = ctx.params;
    const host = `https://arcteryx.com/${country}/en/`;
    const url = `${host}api/fredhopper/query`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            fh_location: `//catalog01/en_CA/gender>{${gender}}/intended_use>{newarrivals}`,
            fh_country: country,
            fh_view_size: 'all',
        },
    });
    const items = response.data.universes.universe[1]['items-section'].items.item;
    items.forEach((item, index, arr) => {
        generateRssData(item, index, arr, country);
    });

    ctx.state.data = {
        title: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items.map((item) => ({
            title: item.name,
            link: productUrl + item.slug,
            description: art(path.join(__dirname, 'templates/product-description.art'), {
                item,
            }),
        })),
    };
};
