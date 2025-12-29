import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { isValidHost } from '@/utils/valid-host';

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

const renderDescription = (img, productsName, price, desc, stack) =>
    renderToString(
        <>
            <img src={img} />
            <h1>{productsName}</h1>
            <p style="color: red;">{price}</p>
            {desc ? <>{raw(desc)}</> : null}
            <hr />
            {stack ? <>{raw(stack)}</> : null}
        </>
    );

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
            description: renderDescription(
                response.data.match(/data-preview-url="(.*?)"/)[1],
                title,
                $('div.price').text(),
                $('section.product-content.product-content__row > section:nth-child(3) > div').html(),
                $('div.product-info').find('ul.stack').html()
            ),
        },
    ];

    return {
        link: url,
        title: `Gumroad - ${userFullName}/${title}`,
        item,
    };
}
