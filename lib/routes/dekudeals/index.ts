import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:type',
    categories: ['game'],
    example: '/dekudeals/most-wanted',
    parameters: { type: 'Category name' },
    name: 'Category',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();

    const host = 'https://www.dekudeals.com/';
    const link = new URL(type, host).href;

    const response = await ofetch(link);
    const $ = load(response);

    const title = $('#search-title').text();

    const out = $('.search-main > .item-grid2 > div.cell')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const img = $item.find('.main-link img').attr('src');
            const price = $item.find('strong').html();
            const oldprice = $item.find('s.text-muted').html();

            return {
                title: $item.find('.name').text(),
                link: new URL($item.find('.main-link').attr('href')!, host).href,
                description: `<img src="${img}"><br><s>${oldprice}</s><br>${price}`,
            };
        });

    return {
        title: `${title}—dekudeals`,
        link,
        item: out,
    };
}
