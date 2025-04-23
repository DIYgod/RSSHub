import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:username/:products',
    categories: ['shopping'],
    example: '/gumroad/afkmaster/Eve10',
    parameters: { username: 'username, can be found in URL', products: 'products name, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Products',
    maintainers: ['Fatpandac'],
    handler,
    description: `\`https://afkmaster.gumroad.com/l/Eve10\` -> \`/gumroad/afkmaster/Eve10\``,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const products = ctx.req.param('products');
    if (!isValidHost(username)) {
        throw new InvalidParameterError('Invalid username');
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

    return {
        link: url,
        title: `Gumroad - ${userFullName}/${title}`,
        item,
    };
}
