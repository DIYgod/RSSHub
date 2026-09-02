import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';

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

const getDataItems = (list: Goods[]): Promise<DataItem[]> =>
    Promise.all(
        list.map((listItem) =>
            cache.tryGet(`xiaomiev:dataitem:${listItem.itemId}`, async () => {
                const detail = await utils.getNewProductItem(listItem);
                return getDataItem(listItem, detail);
            })
        )
    );

const getDataItem = (listItem: Goods, detail: DetailData): DataItem => ({
    title: listItem.name,
    description: utils.renderNewProduct(listItem, detail),
    link: `https://shop.retail.xiaomiev.com/shop/cltd/product?pid=${listItem.itemId}`,
    image: listItem.img800s,
    language: 'zh-CN',
});

async function handler(): Promise<Data> {
    const list = await utils.getNewProductList();
    const items = await getDataItems(list);

    return {
        title: '小米汽车上新',
        link: 'https://www.xiaomiev.com/',
        item: items,
        image: 'https://s1.xiaomiev.com/mi-car-shop/web-shop/assets/logo.svg',
        language: 'zh-CN',
    };
}
