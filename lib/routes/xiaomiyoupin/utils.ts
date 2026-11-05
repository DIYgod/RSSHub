import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import type { z } from 'zod';

import NotFoundError from '@/errors/types/not-found';
import type { Crowdfunding } from '@/routes/mi/templates/crowdfunding';
import type { NewProduct } from '@/routes/mi/templates/newproduct';
import { dedupeByKey } from '@/routes/mi/utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { CommonListItem, CrowdfundingDetailItem, CrowdfundingListItem, NewProductDetailItem, NewProductListItem, VenueQuery } from './types';
import {
    CommonListItemSchema,
    CrowdfundingDetailItemSchema,
    CrowdfundingListSchema,
    GenericDetailResponseSchema,
    GenericListResponseSchema,
    HomepageResponseSchema,
    NewProductDetailItemSchema,
    NewProductListSchema,
    VenuePageResponseSchema,
} from './types';

// Common

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const formatDate = (date: Date): string => dayjs(date).tz('Asia/Shanghai').locale('zh-cn').format('ll');

/**
 * Check whether a list item is a common list item, which nests the goods data under `value.goods`.
 *
 * @param {CrowdfundingListItem | NewProductListItem} item - Crowdfunding or new product list item.
 * @returns {item is CommonListItem} Whether the item is a common list item.
 */
const isCommonListItem = (item: CrowdfundingListItem | NewProductListItem): item is CommonListItem => CommonListItemSchema.safeParse(item).success;

/**
 * Read the goods id from a crowdfunding list item, whether it is a common list item or a flat reservation one.
 *
 * @param {CrowdfundingListItem} item - Crowdfunding list item.
 * @returns {number} Goods id.
 */
const getCrowdfundingId = (item: CrowdfundingListItem): number => (isCommonListItem(item) ? item.value.goods.gid : item.gid);

/**
 * Read the goods id from a new product list item, whether it is a common list item or a flat banner one.
 *
 * @param {NewProductListItem} item - New product list item.
 * @returns {number} Goods id.
 */
const getNewProductId = (item: NewProductListItem): number => (isCommonListItem(item) ? item.value.goods.gid : item.gid);

// Homepage

const getVenueQueryContext = async (title: string): Promise<{ pageId: string; sign: string; jumpUrl: string }> => {
    const response = await ofetch<z.infer<typeof HomepageResponseSchema>>('https://m.xiaomiyoupin.com/homepage/main/v1005', {
        method: 'POST',
        query: {
            platform: 'm',
        },
        responseType: 'json',
        schema: HomepageResponseSchema,
    });
    const floor = response.data.homepage.floors.find((item) => item.module_key === 'kingkong_occupied');
    const jumpUrl = floor?.data.items.find((entry) => entry.item.title === title)?.item.jump_url;
    const searchParams = jumpUrl ? new URL(jumpUrl).searchParams : null;
    const pageId = searchParams?.get('pageid');
    const sign = searchParams?.get('sign');
    if (!jumpUrl || !pageId || !sign) {
        throw new NotFoundError('Failed to get pageid or sign from xiaomiyoupin homepage');
    }
    return { pageId, sign, jumpUrl };
};

// VenuePage

const getVenueQueryList = async (pageId: string, sign: string, resolvers: string[]): Promise<VenueQuery[]> => {
    const response = await ofetch<z.infer<typeof VenuePageResponseSchema>>('https://m.xiaomiyoupin.com/mtop/navi/venue/page', {
        headers: {
            Accept: '*/*',
        },
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
        schema: VenuePageResponseSchema,
    });
    const queryList = response.data.floors.flatMap((floor) => floor.query_list ?? []).filter((query) => resolvers.includes(query.resolver));
    return queryList;
};

// List

const getListItems = async <List>(pageId: string, sign: string, queryList: VenueQuery[], listSchema: z.ZodType<List>): Promise<List[]> => {
    if (queryList.length === 0) {
        return [];
    }
    const schema = GenericListResponseSchema(listSchema);
    const response = await ofetch<z.infer<typeof schema>>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
        body: {
            query_list: queryList,
        },
        method: 'POST',
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
        schema,
    });
    return response.data.result_list;
};

/**
 * Fetch the crowdfunding list from the `kingkong_occupied` homepage floor named `小米众筹`.
 *
 * @returns {Promise<{ list: CrowdfundingListItem[]; jumpUrl: string }>} Deduplicated crowdfunding list items and the venue page URL.
 */
const getCrowdfundingList = async (): Promise<{ list: CrowdfundingListItem[]; jumpUrl: string }> => {
    const { pageId, sign, jumpUrl } = await getVenueQueryContext('小米众筹');
    const queryList = await getVenueQueryList(pageId, sign, ['crowd-funding', 'reservation']);
    const resultList = await getListItems(pageId, sign, queryList, CrowdfundingListSchema);
    const batchList = resultList.flat();
    const list = dedupeByKey(batchList, (item) => getCrowdfundingId(item));
    return { list, jumpUrl };
};

/**
 * Fetch the new product list from the `kingkong_occupied` homepage floor named `上新精选`.
 *
 * @returns {Promise<{ list: NewProductListItem[]; jumpUrl: string }>} Deduplicated new product list items and the venue page URL.
 */
const getNewProductList = async (): Promise<{ list: NewProductListItem[]; jumpUrl: string }> => {
    const { pageId, sign, jumpUrl } = await getVenueQueryContext('上新精选');
    const queryList = await getVenueQueryList(pageId, sign, ['leek-super', 'leek-selective']);
    const resultList = await getListItems(pageId, sign, queryList, NewProductListSchema);
    const batchList = resultList.flat();
    const list = dedupeByKey(batchList, (item) => getNewProductId(item));
    return { list, jumpUrl };
};

// Detail

const getDetailItem = async <DetailItem>(gid: number, detailItemSchema: z.ZodType<DetailItem>): Promise<DetailItem> => {
    const schema = GenericDetailResponseSchema(detailItemSchema);
    const response = await ofetch<z.infer<typeof schema>>('https://m.xiaomiyoupin.com/api/gateway/detail', {
        body: {
            channel: '',
            debug: false,
            groupName: 'details',
            groupParams: [[String(gid)]],
            methods: [],
            system: '2',
            version: '1.0.0',
            vipMode: true,
        },
        headers: {
            'X-User-Agent': 'channel/youpin platform/youpin.m',
        },
        method: 'POST',
        schema,
    });
    return response.data.goods;
};

/**
 * Fetch the crowdfunding goods detail by the goods id of a list item.
 *
 * @param {CrowdfundingListItem} item - Crowdfunding list item.
 * @returns {Promise<CrowdfundingDetailItem>} Crowdfunding goods detail.
 */
const getCrowdfundingItem = (item: CrowdfundingListItem): Promise<CrowdfundingDetailItem> => getDetailItem(getCrowdfundingId(item), CrowdfundingDetailItemSchema);

/**
 * Fetch the new product goods detail by the goods id of a list item.
 *
 * @param {NewProductListItem} item - New product list item.
 * @returns {Promise<NewProductDetailItem>} New product goods detail.
 */
const getNewProductItem = (item: NewProductListItem): Promise<NewProductDetailItem> => getDetailItem(getNewProductId(item), NewProductDetailItemSchema);

// Conversion

const toSellPointList = (goodsInfo: CrowdfundingDetailItem['goodsInfo']): string[] =>
    [goodsInfo.firstSellPoint, goodsInfo.secondSellPoint, goodsInfo.thirdSellPoint].map((point) => point.trim()).filter((point): point is string => Boolean(point));

const toSupportList = (detailItem: CrowdfundingDetailItem): Crowdfunding['supportList'] => {
    const supportList = detailItem.goodsInfo.pids.map((pid) => {
        const product = detailItem.productInfo[pid];
        return {
            image: product.img,
            name: product.attributeValues.join(' '),
            price: String((product.onHandPrice?.at(0)?.price ?? product.price) / 100),
            description: product.name,
        };
    });
    const groupBuyGood = detailItem.oneYuanSupport.groupBuyInfo?.good;
    if (groupBuyGood) {
        supportList.push({
            image: groupBuyGood.img,
            name: '1元支持',
            price: String(groupBuyGood.groupbuy_price / 100),
            description: groupBuyGood.groupbuy_summary,
        });
    }
    return supportList;
};

const toGoodsList = (detailItem: NewProductDetailItem): NewProduct['goodsList'] =>
    detailItem.goodsInfo.pids.map((pid) => {
        const product = detailItem.productInfo[pid];
        return {
            image: product.img,
            name: product.attributeValues.join(' '),
            marketPrice: String(product.marketPrice / 100),
            price: String((product.onHandPrice?.at(0)?.price ?? product.singlePrice?.at(0)?.price ?? product.price) / 100),
        };
    });

/**
 * Build Crowdfunding template props from a crowdfunding goods detail.
 *
 * @param {CrowdfundingListItem} listItem - Crowdfunding list item, which the template props do not use.
 * @param {CrowdfundingDetailItem} detailItem - Crowdfunding goods detail.
 * @returns {Crowdfunding} Crowdfunding template props.
 */
const toCrowdfunding = (listItem: CrowdfundingListItem, detailItem: CrowdfundingDetailItem): Crowdfunding => ({
    image: detailItem.goodsInfo.imgHorizon,
    sellPointList: toSellPointList(detailItem.goodsInfo),
    price: String((detailItem.priceInfo.priceInfo.onHandPrice?.price ?? detailItem.priceInfo.priceInfo.marketPrice) / 100),
    marketPrice: String(detailItem.priceInfo.priceInfo.marketPrice / 100),
    startTime: parseDate(detailItem.crowdFunding.startTime, 'X'),
    endTime: parseDate(detailItem.crowdFunding.endTime, 'X'),
    sendInfo: `预计${formatDate(parseDate(detailItem.crowdFunding.estimateSendtime, 'X'))}前发货`,
    supportList: toSupportList(detailItem),
});

/**
 * Build NewProduct template props from a new product goods detail.
 *
 * @param {NewProductListItem} listItem - New product list item, which the template props do not use.
 * @param {NewProductDetailItem} detailItem - New product goods detail.
 * @returns {NewProduct} New product template props.
 */
const toNewProduct = (listItem: NewProductListItem, detailItem: NewProductDetailItem): NewProduct => ({
    image: detailItem.goodsInfo.imgHorizon,
    sellPointList: toSellPointList(detailItem.goodsInfo),
    goodsList: toGoodsList(detailItem),
});

export default {
    getCrowdfundingList,
    getCrowdfundingItem,
    getNewProductList,
    getNewProductItem,
    isCommonListItem,
    getCrowdfundingId,
    getNewProductId,
    toCrowdfunding,
    toNewProduct,
};
