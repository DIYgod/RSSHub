import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/shop/:subdomain',
    categories: ['shopping'],
    example: '/booth.pm/shop/annn-boc0123',
    parameters: { subdomain: 'Shop subdomain' },
    name: 'Shop',
    maintainers: ['KTachibanaM'],
    handler,
};

async function handler(ctx: Context) {
    const { subdomain } = ctx.req.param();
    if (!isValidHost(subdomain)) {
        throw new Error('Invalid subdomain');
    }
    const shopUrl = `https://${subdomain}.booth.pm`;

    const response = await ofetch(`${shopUrl}/items`, {
        headers: {
            cookie: 'adult=t',
        },
    });
    const $ = load(response);

    const shopName = $('div.shop-name > span').text();

    const items: DataItem[] = $('li.js-mount-point-shop-item-card')
        .toArray()
        .map((element) => {
            const item = JSON.parse($(element).attr('data-item')!);
            return {
                title: item.name,
                description: item.thumbnail_image_urls.map((url: string) => `<img src="${url.replace(/\/c\/[^/]+\//, '/').replace('_base_resized', '')}">`).join(''),
                link: item.shop_item_url,
                category: [item.category.name.en, item.category.name.ja],
            };
        });

    return {
        title: shopName,
        link: shopUrl,
        description: $('.booth-description > div > div').first().text(),
        image: $('.avatar-image')
            .attr('style')
            ?.match(/url\((.*?)\)/)?.[1],
        allowEmpty: true,
        item: items,
    };
}
