import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/goods/:id',
    categories: ['shopping'],
    example: '/weidian/goods/431508863',
    parameters: { id: '商铺 id' },
    name: '商品上新',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const link = `https://weidian.com/?userid=${id}`;
    const apiLink = `https://thor.weidian.com/ares/shop.getItemsInShop/1.0?param={"shopId":"${id}","tabId":3,"sortOrder":"desc","limit":20,"page":1}`;

    const shopResponse = await ofetch(link);
    const $ = load(shopResponse);
    const shopName = $('.shop-name').text();

    const response = await ofetch(apiLink, {
        headers: {
            Referer: link,
        },
    });
    const goods = response.result.shopItems.items;

    return {
        title: `${shopName || id} 商铺上新`,
        link,
        item: goods.map((good) => ({
            title: good.itemName,
            description: `价格：${Number.parseInt(good.itemPrice) / 100}<br><img src="${good.itemMainPic}">`,
            link: `https://weidian.com/item.html?itemID=${good.itemId}`,
            pubDate: parseDate(good.time, 'x'),
        })),
    };
}
