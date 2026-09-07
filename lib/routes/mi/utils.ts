import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Crowdfunding } from './templates/crowdfunding';
import type { NewProduct } from './templates/newproduct';
import type { CrowdfundingDetailItem, CrowdfundingDetailResponse, CrowdfundingListItem, CrowdfundingListResponse, NewProductDetailItem, NewProductDetailResponse, NewProductListItem, NewProductListResponse } from './types';

/**
 * Fetch the list of crowdfunding projects, merging the current projects (primary) with the history projects (supplement).
 *
 * @returns {Promise<CrowdfundingListItem[]>} The merged crowdfunding project list.
 */
export const getCrowdfundingList = async (): Promise<CrowdfundingListItem[]> => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const fetch = (query?: Record<string, number>) =>
        ofetch<CrowdfundingListResponse>('https://m.mi.com/v1/crowd/crowd_home', {
            method: 'POST',
            query,
        });
    const [response, historyResponse] = await Promise.all([fetch(), fetch({ status: 1 })]);
    const map = new Map<number, CrowdfundingListItem>();
    const setIfNeeded = (items: CrowdfundingListItem[]) => {
        for (const item of items) {
            if (!map.has(item.project_id)) {
                map.set(item.project_id, item);
            }
        }
    };
    for (const group of response.data.list) {
        setIfNeeded(group.items);
    }
    for (const group of historyResponse.data.list) {
        setIfNeeded(group.items);
    }
    return map.values().toArray();
};

/**
 * Fetch crowdfunding project details.
 *
 * @param {CrowdfundingListItem} item - Crowdfunding item.
 * @returns {Promise<CrowdfundingDetailItem>} Crowdfunding item details.
 */
export const getCrowdfundingItem = async (item: CrowdfundingListItem): Promise<CrowdfundingDetailItem> => {
    const response = await ofetch<CrowdfundingDetailResponse>('https://m.mi.com/v1/crowd/crowd_detail', {
        method: 'POST',
        query: {
            project_id: item.project_id,
        },
    });
    return response.data.crowd_funding_info;
};

/**
 * Fetch the list of new products, merging `date_list` (primary) with `history_date_list` (supplement) and `new_list` (supplement).
 *
 * @returns {Promise<NewProductListItem[]>} The merged new product list.
 */
export const getNewProductList = async (): Promise<NewProductListItem[]> => {
    const response = await ofetch<NewProductListResponse>('https://api.m.mi.com/v1/home/product_channel_get_list', {
        method: 'POST',
    });
    const map = new Map<number, NewProductListItem>();
    const setIfNeeded = (items: NewProductListItem[]) => {
        for (const item of items) {
            if (!map.has(item.product_id)) {
                map.set(item.product_id, item);
            }
        }
    };
    for (const group of response.data.date_list) {
        setIfNeeded(group.product_list);
    }
    for (const group of response.data.history_date_list) {
        setIfNeeded(group.product_list);
    }
    setIfNeeded(response.data.new_list);
    return map.values().toArray();
};

/**
 * Fetch new product details.
 *
 * @param {NewProductListItem} item - New product list item.
 * @returns {Promise<NewProductDetailItem>} New product details.
 */
export const getNewProductItem = async (item: NewProductListItem): Promise<NewProductDetailItem> => {
    const response = await ofetch<NewProductDetailResponse>('https://m.mi.com/mtop/xiaomishop/product/info', {
        body: [{}, { productId: item.product_id }],
        method: 'POST',
    });
    return response.data;
};

/**
 * Convert CrowdfundingListItem + CrowdfundingDetailItem to Crowdfunding template props.
 *
 * @param {CrowdfundingListItem} listItem - Crowdfunding list item.
 * @param {CrowdfundingDetailItem} detailItem - Crowdfunding detail item.
 * @returns {Crowdfunding} Crowdfunding template props.
 */
export const toCrowdfunding = (listItem: CrowdfundingListItem, detailItem: CrowdfundingDetailItem): Crowdfunding => ({
    image: detailItem.big_image,
    sellPoint: detailItem.project_desc,
    price: detailItem.price,
    marketPrice: listItem.product_market_price,
    startTime: parseDate(detailItem.start_time, 'X'),
    endTime: parseDate(detailItem.end_time, 'X'),
    sendInfo: detailItem.send_info,
    supportList: detailItem.support_list.map((support) => ({
        image: support.goods_list[0]?.goods_image ?? '',
        name: support.name,
        price: support.price,
        description: support.support_desc,
    })),
});

/**
 * Convert NewProductListItem + NewProductDetailItem to NewProduct template props.
 *
 * @param {NewProductListItem} listItem - New product list item.
 * @param {NewProductDetailItem} detailItem - New product detail item.
 * @returns {NewProduct} New product template props.
 */
export const toNewProduct = (listItem: NewProductListItem, detailItem: NewProductDetailItem): NewProduct => ({
    image: listItem.img,
    sellPointList: detailItem.product.sellPointList,
    goodsList: [...(detailItem.goodsInfo.goodsList ?? []), ...(detailItem.relationBatchedInfo?.relationBatchedList.flatMap((relation) => relation.goodsInfo) ?? [])].map((goods) => ({
        image: goods.imgUrl,
        name: goods.name,
        marketPrice: goods.marketPrice,
        price: goods.price,
    })),
});

export default {
    getCrowdfundingList,
    getCrowdfundingItem,
    getNewProductList,
    getNewProductItem,
    toCrowdfunding,
    toNewProduct,
};
