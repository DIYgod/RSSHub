import type { NewProduct } from '@/routes/mi/templates/newproduct';
import ofetch from '@/utils/ofetch';

import type { NewProductDetailItem, NewProductDetailResponse, NewProductListItem, NewProductListResponse } from './types';

/**
 * Fetch the list of new products, extracting goods from every `car_product_list_new` floor.
 *
 * @returns {Promise<NewProductListItem[]>} The new product list.
 */
export const getNewProductList = async (): Promise<NewProductListItem[]> => {
    const response = await ofetch<NewProductListResponse>('https://carshop-api.retail.xiaomiev.com/mtop/carlife/home/index/v2', {
        body: [
            {
                isPreview: false,
                pageId: '19573',
                vehicleSeries: 'ALL',
            },
        ],
        method: 'POST',
    });
    const items = response.data.floors
        .filter((floor) => floor.moduleKey === 'car_product_list_new')
        .flatMap((floor) => (floor.dynamicData ?? []).flatMap((block) => block.list.filter((item) => item.type === 'goods').map((item) => ({ ...item.value.goods, startTime: item.value.goods.startTime || floor.startTime }))));
    const list = Map.groupBy(items, (item) => item.itemId)
        .values()
        .toArray()
        .map((group) => group[0]);
    return list;
};

/**
 * Fetch new product details.
 *
 * @param {NewProductListItem} item - New product list item.
 * @returns {Promise<NewProductDetailItem>} New product details.
 */
export const getNewProductItem = async (item: NewProductListItem): Promise<NewProductDetailItem> => {
    const response = await ofetch<NewProductDetailResponse>('https://carshop-api.retail.xiaomiev.com/mtop/carlife/product/info/v2', {
        body: [
            {},
            {
                configVersion: 1,
                productId: item.itemId,
                servicePackageVersion: 2,
            },
        ],
        headers: {
            'X-User-Agent': 'channel/car platform/carlife.ios',
        },
        method: 'POST',
    });
    return response.data;
};

/**
 * Convert xiaomiev NewProductListItem + NewProductDetailItem to NewProduct template props.
 *
 * @param {NewProductListItem} listItem - New product list item.
 * @param {NewProductDetailItem} detailItem - New product detail item.
 * @returns {NewProduct} New product template props.
 */
export const toNewProduct = (listItem: NewProductListItem, detailItem: NewProductDetailItem): NewProduct => ({
    image: listItem.img800s,
    sellPointList: detailItem.product.sellPointList,
    goodsList: [...detailItem.goodsInfo.goodsList, ...detailItem.batchedSsuList, ...Object.values(detailItem.batchedInfoMap ?? {}).flatMap(({ batchedSsuList }) => batchedSsuList)].map((goods) => ({
        image: goods.imgUrl,
        name: goods.name,
        marketPrice: goods.marketPrice,
        price: goods.price,
    })),
});

export default {
    getNewProductList,
    getNewProductItem,
    toNewProduct,
};
