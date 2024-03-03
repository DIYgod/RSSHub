// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const username = ctx.req.param('username');
    const products = ctx.req.param('products');
    if (!isValidHost(username)) {
        throw new Error('Invalid username');
    }
    const url = `https://${username}.gumroad.com/l/${products}`;

    const response = await got(url);
    const $ = load(response.data);
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

    ctx.set('data', {
        link: url,
        title: `Gumroad - ${userFullName}/${title}`,
        item,
    });
};
