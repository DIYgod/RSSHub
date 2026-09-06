import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/chart/:category?',
    categories: ['multimedia'],
    example: '/melon/chart',
    parameters: { category: 'Category, see below, 24H by default' },
    name: 'Chart',
    maintainers: ['nczitzk'],
    description: `| 24H | 일간 | 주간 | 월간  |
| --- | ---- | ---- | ----- |
|     | day  | week | month |`,
    handler,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    const rootUrl = 'https://www.melon.com';
    const currentUrl = `${rootUrl}/chart/${category ? category + '/' : ''}index.htm`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const items = $('tr[data-song-no]')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const image = $item
                .find('.image_typeAll img')
                .attr('src')!
                .split(/\/melon\//, 1)[0];
            const title = $item.find('.rank01').text();
            const name = $item.find('.rank02').text();
            const album = $item.find('.rank03').text();

            return {
                link: `${rootUrl}/song/detail.htm?songId=${$item.attr('data-song-no')}`,
                title,
                description: `<img src="${image}"><p>${title}</p><p>${name}</p><p>${album}</p>`,
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
