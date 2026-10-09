import { createHash } from 'node:crypto';

import { load } from 'cheerio';
import { escapeText } from 'entities';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const markets = { tw: 'com.tw', my: 'my', sg: 'sg', th: 'co.th', kr: 'co.kr', au: 'com.au', id: 'co.id', ph: 'ph' };

export const route: Route = {
    path: '/cashback/:store/:market?',
    example: '/shopback/cashback/agoda/tw',
    name: 'Merchant cashback rates',
    categories: ['shopping'],
    maintainers: ['DIYgod'],
    parameters: { store: 'Merchant slug from its ShopBack URL.', market: 'tw (default), my, sg, th, kr, au, id, or ph.' },
    description:
        'Includes the merchant’s current cashback rates. Each distinct product-and-rate combination has a separate GUID. A return to a previously seen rate reuses its earlier GUID. The former product/search and store/search endpoints are no longer available.',
    radar: [{ source: ['www.shopback.com.tw/:store'], target: '/cashback/:store/tw' }],
    handler,
};

async function handler(ctx) {
    const store = ctx.req.param('store');
    const market = ctx.req.param('market') ?? 'tw';
    if (!Object.hasOwn(markets, market) || !/^[a-z0-9-]+$/i.test(store)) {
        throw new InvalidParameterError('Use a supported market and the merchant slug from its ShopBack URL.');
    }
    const link = `https://www.shopback.${markets[market]}/${store}`;
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('h1').text();
    const items = $('table tbody tr')
        .toArray()
        .map((element) => {
            const row = $(element);
            const cells = row.find('td');
            const product = cells.eq(0).text();
            const rate = cells.eq(1).text();
            const hash = createHash('sha256').update(`${product}:${rate}`).digest('hex');
            return {
                title: `${product}: ${rate}`,
                link: `${link}#${hash}`,
                guid: `${link}#${hash}`,
                description: `<p>${escapeText(rate)}</p>`,
            };
        })
        .filter((item) => item.title && item.description);
    return { title: `${name || store} - ShopBack cashback`, link, item: items };
}
