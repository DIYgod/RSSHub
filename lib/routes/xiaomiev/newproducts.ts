import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';

import type { DetailData, Goods } from './types';
import utils from './utils';

export const route: Route = {
    path: '/newproducts',
    categories: ['shopping'],
    example: '/xiaomiev/newproducts',
    name: '小米汽车上新',
    maintainers: ['nuomi1'],
    handler,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Notifications,
};

const getDetails = async (list: Map<number, Goods>): Promise<Map<number, DetailData>> => {
    const details = await Promise.all(list.values().map((item) => utils.getNewProductItem(item)));
    return new Map(details.map((detail) => [detail.product.productId, detail]));
};

const getDataItem = (listItem: Goods, detail: DetailData) =>
    ({
        title: listItem.name,
        description: utils.renderNewProduct(listItem, detail),
        link: `https://shop.retail.xiaomiev.com/shop/cltd/product?pid=${listItem.itemId}`,
        image: listItem.img800s,
        language: 'zh-CN',
    }) as DataItem;

async function handler() {
    const list = await utils.getNewProductList();
    const details = await getDetails(list);

    const items: DataItem[] = list
        .values()
        .toArray()
        .map((item) => {
            const detail = details.get(item.itemId);
            if (!detail) {
                throw new Error(`Details not found for product ${item.itemId}`);
            }
            return getDataItem(item, detail);
        });

    return {
        title: '小米汽车上新',
        link: 'https://www.xiaomiev.com/',
        item: items,
        image: 'https://s1.xiaomiev.com/mi-car-shop/web-shop/assets/logo.svg',
        language: 'zh-CN',
    } as Data;
}
