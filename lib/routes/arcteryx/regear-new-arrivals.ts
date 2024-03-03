// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

const host = 'https://www.regear.arcteryx.com';
function getUSDPrice(number) {
    return (number / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
export default async (ctx) => {
    const url = `${host}/shop/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
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
        data.regearPrice = item.priceRange[0] === item.priceRange[1] ? getUSDPrice(item.priceRange[0]) : `${getUSDPrice(item.priceRange[0])} - ${getUSDPrice(item.priceRange[1])}`;
        data.description = art(path.join(__dirname, 'templates/regear-product-description.art'), {
            data,
        });
        return data;
    });

    ctx.set('data', {
        title: 'Arcteryx - Regear - New Arrivals',
        link: url,
        description: 'Arcteryx - Regear - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            link: item.link,
            description: item.description,
        })),
    });
};
