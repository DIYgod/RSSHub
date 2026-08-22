import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
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

const getDetails = async (list: NewProductItem[]): Promise<Map<number, NewProductDetailData>> => {
    const result: Array<Promise<NewProductDetailData>> = list.map((item) => utils.getNewProductItem(item));
    const details = await Promise.all(result);
    return new Map(details.map((detail) => [detail.product.productId, detail]));
};

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
    const details = await getDetails(list);

    const items: DataItem[] = list.map((item) => {
        const detail = details.get(item.product_id);
        if (!detail) {
            throw new Error(`Details not found for product ${item.product_id}`);
        }
        return getDataItem(item, detail);
    });

    return {
        title: '小米上新',
        link: 'https://m.mi.com/',
        item: items,
        allowEmpty: true,
        image: 'https://m.mi.com/static/img/icons/apple-touch-icon-152x152.png',
        language: 'zh-CN',
    };
}
