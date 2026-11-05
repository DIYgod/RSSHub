import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
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
    description: '`https://afkmaster.gumroad.com/l/Eve10` -> `/gumroad/afkmaster/Eve10`',
};

const renderDescription = (covers: Array<{ type: string; url: string; thumbnail?: string }>, description: string) =>
    renderToString(
        <>
            {covers.map((cover) => (cover.type === 'image' ? <img src={cover.url} /> : cover.type === 'video' ? <video controls src={cover.url} poster={cover.thumbnail} /> : <a href={cover.url}>View cover</a>))}
            {raw(description)}
        </>
    );

async function handler(ctx): Promise<Data> {
    const username = ctx.req.param('username');
    const products = ctx.req.param('products');
    if (!isValidHost(username)) {
        throw new InvalidParameterError('Invalid username');
    }
    const url = `https://${username}.gumroad.com/l/${products}`;

    const response = await got(url);
    const $ = load(response.data);
    const pageData = $('[data-page]').attr('data-page');
    if (!pageData) {
        throw new Error('Gumroad product data was not found on the public product page');
    }
    const { product } = JSON.parse(pageData).props;
    if (!product) {
        throw new Error('Gumroad did not return a product on the public product page');
    }
    const title = product.name;
    const userFullName = product.seller.name;
    const item = [
        {
            title,
            link: url,
            author: userFullName,
            description: renderDescription(product.covers, product.description_html),
        },
    ];

    return {
        link: url,
        language: 'en',
        title: `Gumroad - ${userFullName}/${title}`,
        item,
    };
}
