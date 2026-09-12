import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import type { NewProductDetailData, NewProductItem } from './types';
import utils from './utils';

export const route: Route = {
    path: '/newproducts',
    categories: ['shopping'],
    example: '/mi/newproducts',
    name: '小米上新',
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

const getDataItems = (list: NewProductItem[]): Promise<DataItem[]> =>
    Promise.all(
        list.map((listItem) =>
            cache.tryGet(`mi:product:dataitem:${listItem.product_id}`, async () => {
                const detail = await utils.getNewProductItem(listItem);
                return getDataItem(listItem, detail);
            })
        )
    );

const getDataItem = (listItem: NewProductItem, detail: NewProductDetailData): DataItem => ({
    title: listItem.product_name,
    description: utils.renderNewProduct(listItem, detail),
    link: `https://m.mi.com/commodity/detail/${listItem.product_id}`,
    image: listItem.img,
    pubDate: parseDate(listItem.start_time, 'X'),
    language: 'zh-CN',
});

async function handler(): Promise<Data> {
    const list = await utils.getNewProductList();
    const items = await getDataItems(list);

    return {
        title: '小米上新',
        link: 'https://m.mi.com/',
        item: items,
        image: 'https://m.mi.com/static/img/icons/apple-touch-icon-152x152.png',
        language: 'zh-CN',
    };
}
