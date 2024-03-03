// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { load } from 'cheerio';
const host = 'https://www.zagg.com/en_us';
export default async (ctx) => {
    const query = ctx.req.param('query');
    const params = new URLSearchParams(query);
    const brands = params.get('brand');
    const categories = params.get('cat');

    const url = `${host}/new-arrivals`;
    const response = await got({
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'post',
        url,
        searchParams: {
            cat: categories,
            brand: brands,
        },
    });
    const products = response.data.products;

    const $ = load(products);
    const list = $('.item.product.product-item')
        .map(function () {
            const data = {};
            const details = $(this).find('.product.details-box').html();
            data.link = $(this).find('.product-item-link').eq(0).attr('href');
            data.title = $(this).find('.product-item-link').text();
            const regex = /(https.*?)\?/;
            const imgUrl = $(this).find('img').eq(0).attr('data-src').match(regex)[1];
            const img = art(path.join(__dirname, 'templates/new-arrivals.art'), {
                imgUrl,
            });
            data.description = details + img;
            return data;
        })
        .get();
    ctx.set('data', {
        title: 'Zagg - New Arrivals',
        link: response.url,
        description: 'Zagg - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
        })),
    });
};
