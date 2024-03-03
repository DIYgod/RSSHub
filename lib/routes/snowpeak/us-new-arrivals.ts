// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { load } from 'cheerio';
const host = 'https://www.snowpeak.com';
export default async (ctx) => {
    const url = `${host}/collections/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const $ = load(data);
    const list = $('.element.product-tile')
        .map(function () {
            const data = {};
            const product = $(this).find('.product-data').data('product');
            data.title = product.title;
            data.link = `${host}/products/${product.handle}`;
            data.pubDate = new Date(product.published_at).toUTCString();
            data.category = product.tags;
            data.variants = product.variants.map((item) => item.name);
            data.description =
                product.description +
                art(path.join(__dirname, 'templates/new-arrivals.art'), {
                    product,
                });

            return data;
        })
        .get();
    ctx.set('data', {
        title: 'Snow Peak - New Arrivals',
        link: `${host}/new-arrivals`,
        description: 'Snow Peak - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            category: item.category,
            description: item.description,
            pubDate: item.pubDate,
            link: item.link,
        })),
    });
};
