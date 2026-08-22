import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/goods/:id',
    categories: ['shopping'],
    example: '/youzan/goods/13328377',
    parameters: { id: '商铺 id' },
    name: '商品上新',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const link = `https://h5.youzan.com/wscshop/showcase/homepage?kdt_id=${id}`;
    const apiLink = `https://h5.youzan.com/wscshop/showcase/goods/allGoods.json?pageSize=20&page=1&offlineId=0&order=&order_by=createdTime&kdt_id=${id}`;

    const shopResponse = await ofetch(link);
    const $ = load(shopResponse);
    const shopname = $('meta[name="keywords"]').attr('content');

    const response = await ofetch(apiLink, {
        headers: {
            Referer: link,
        },
    });
    const goods = response.data.list;

    const items = goods.map((good) => ({
        title: good.title,
        description: `价格：${good.price}<br>${good.picture.map((picture) => `<img src="${picture.url}">`).join('')}`,
        link: `https://detail.youzan.com/show/goods?alias=${good.alias}`,
        pubDate: parseDate(good.created_date_time),
    }));

    return {
        title: `${shopname || id} 商铺上新`,
        link,
        item: items,
    };
}
