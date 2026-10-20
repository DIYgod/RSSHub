import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import NotFoundError from '@/errors/types/not-found';
import type { Crowdfunding } from '@/routes/mi/templates/crowdfunding';
import type { NewProduct } from '@/routes/mi/templates/newproduct';
import { dedupeByKey } from '@/routes/mi/utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type {
    CrowdfundingBatchListItem,
    CrowdfundingBatchResponse,
    GoodsDetailItem,
    GoodsDetailResponse,
    HomepageMainResponse,
    NewProductBatchListItem,
    NewProductBatchResponse,
    VenueBannerBatchItem,
    VenueGoodsBatchItem,
    VenuePageResponse,
    VenueQuery,
    VenueReservationBatchItem,
} from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const formatDate = (date: Date): string => dayjs(date).tz('Asia/Shanghai').locale('zh-cn').format('ll');

const parsePageQuery = (url?: string): { pageId: string; sign: string } => {
    const searchParams = url ? new URL(url).searchParams : null;
    const pageId = searchParams?.get('pageid');
    const sign = searchParams?.get('sign');
    if (!pageId || !sign) {
        throw new NotFoundError('Failed to get pageid or sign from xiaomiyoupin homepage');
    }
    return { pageId, sign };
};

const getVenueQueryContext = async (moduleKey: string): Promise<{ pageId: string; sign: string }> => {
    const response = await ofetch<HomepageMainResponse>('https://m.xiaomiyoupin.com/homepage/main/v1005', {
        responseType: 'json',
    });
    const floor = response.data.homepage.floors.find((item) => item.module_key === moduleKey);
    const url = floor?.data.jump_url ?? floor?.data.pic_jump_url;
    return parsePageQuery(url);
};

const getVenuePageQueryList = async (pageId: string, sign: string, resolvers: string[]): Promise<VenueQuery[]> => {
    const response = await ofetch<VenuePageResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/page', {
        headers: {
            accept: '*/*',
        },
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
    });
    const queryList = response.data.floors.flatMap((floor) => floor.query_list ?? []).filter((query) => resolvers.includes(query.resolver));
    return queryList;
};

type VenueBatchItem = NewProductBatchListItem | VenueReservationBatchItem;

const isVenueGoodsBatchItem = (item: VenueBatchItem): item is VenueGoodsBatchItem => 'value' in item;

const isVenueGoodsTypeBatchItem = (item: VenueBatchItem): item is VenueGoodsBatchItem => isVenueGoodsBatchItem(item) && item.type === 'goods';

const isVenueBannerBatchItem = (item: VenueBatchItem): item is VenueBannerBatchItem => 'new_product_name' in item;

/**
 * Read the goods id from a crowdfunding batch item, whether it is a nested venue goods entry or a flat entry.
 *
 * @param {CrowdfundingBatchListItem} item - Crowdfunding batch item.
 * @returns {number} Goods id.
 */
export const getCrowdfundingGid = (item: CrowdfundingBatchListItem): number => (isVenueGoodsBatchItem(item) ? item.value.goods.gid : item.gid!);

/**
 * Read the goods name from a crowdfunding batch item.
 *
 * @param {CrowdfundingBatchListItem} item - Crowdfunding batch item.
 * @returns {string} Goods name.
 */
export const getCrowdfundingName = (item: CrowdfundingBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.name : item.goodsInfo.name);

/**
 * Read the square image URL from a crowdfunding batch item.
 *
 * @param {CrowdfundingBatchListItem} item - Crowdfunding batch item.
 * @returns {string} Square image URL.
 */
export const getCrowdfundingImage = (item: CrowdfundingBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.img_square : item.goodsInfo.img_square);

/**
 * Read the goods id from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {number} Goods id.
 */
export const getNewProductGid = (item: NewProductBatchListItem): number => (isVenueGoodsBatchItem(item) ? item.value.goods.gid : item.gid);

/**
 * Read the goods name from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {string} Goods name.
 */
export const getNewProductName = (item: NewProductBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.name : item.new_product_name);

/**
 * Read the square image URL from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {string} Square image URL.
 */
export const getNewProductImage = (item: NewProductBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.img_square : item.picture_url);

/**
 * Read the first release timestamp from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {number | undefined} First release timestamp, or `undefined` when the item does not provide one.
 */
export const getNewProductFirstReleaseTime = (item: NewProductBatchListItem): number | undefined => (isVenueGoodsBatchItem(item) ? item.value.goods.fist_release_time : undefined);

const getCrowdfundingBatchList = async (pageId: string, sign: string, queryList: VenueQuery[]): Promise<CrowdfundingBatchListItem[]> => {
    const response = await ofetch<CrowdfundingBatchResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
        body: {
            query_list: queryList,
        },
        method: 'POST',
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
    });
    const list = response.data.result_list.flatMap((result): CrowdfundingBatchListItem[] => {
        if ('list' in result) {
            return result.list.filter((item): item is VenueGoodsBatchItem => isVenueGoodsTypeBatchItem(item));
        }
        if (result.gid === undefined || result.gid === null) {
            return [];
        }
        return [result];
    });
    return list;
};

const getNewProductBatchList = async (pageId: string, sign: string, queryList: VenueQuery[]): Promise<NewProductBatchListItem[]> => {
    const response = await ofetch<NewProductBatchResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
        body: {
            query_list: queryList,
        },
        method: 'POST',
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
    });
    const list = response.data.result_list.flatMap((result) => result.list).filter((item): item is NewProductBatchListItem => isVenueGoodsTypeBatchItem(item) || isVenueBannerBatchItem(item));
    return list;
};

/**
 * Fetch the new product list from the `product_hot` homepage floor.
 *
 * @returns {Promise<NewProductBatchListItem[]>} Deduplicated new product batch items.
 */
export const getNewProductList = async (): Promise<NewProductBatchListItem[]> => {
    const { pageId, sign } = await getVenueQueryContext('product_hot');
    const queryList = await getVenuePageQueryList(pageId, sign, ['leek-super', 'leek-selective']);
    const batchList = await getNewProductBatchList(pageId, sign, queryList);
    const list = dedupeByKey(batchList, (item) => getNewProductGid(item));
    return list;
};

/**
 * Fetch the crowdfunding list from the `crowd_funding` homepage floor.
 *
 * @returns {Promise<CrowdfundingBatchListItem[]>} Deduplicated crowdfunding batch items.
 */
export const getCrowdfundingList = async (): Promise<CrowdfundingBatchListItem[]> => {
    const { pageId, sign } = await getVenueQueryContext('crowd_funding');
    const queryList = await getVenuePageQueryList(pageId, sign, ['crowd-funding', 'reservation']);
    const batchList = await getCrowdfundingBatchList(pageId, sign, queryList);
    const list = dedupeByKey(batchList, (item) => getCrowdfundingGid(item));
    return list;
};

const getGoodsItem = async (gid: number): Promise<GoodsDetailItem> => {
    const response = await ofetch<GoodsDetailResponse>('https://m.xiaomiyoupin.com/api/gateway/detail', {
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
    });
    return response.data.goods;
};

/**
 * Fetch crowdfunding goods details by the goods id of a batch item.
 *
 * @param {CrowdfundingBatchListItem} item - Crowdfunding batch item.
 * @returns {Promise<GoodsDetailItem>} Goods detail.
 */
export const getCrowdfundingItem = (item: CrowdfundingBatchListItem): Promise<GoodsDetailItem> => getGoodsItem(getCrowdfundingGid(item));

/**
 * Fetch new product goods details by the goods id of a batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {Promise<GoodsDetailItem>} Goods detail.
 */
export const getNewProductItem = (item: NewProductBatchListItem): Promise<GoodsDetailItem> => getGoodsItem(getNewProductGid(item));

const toSellPointList = (goodsInfo: GoodsDetailItem['goodsInfo']): string[] =>
    [goodsInfo.firstSellPoint, goodsInfo.secondSellPoint, goodsInfo.thirdSellPoint].map((point) => point.trim()).filter((point): point is string => Boolean(point));

const toSupportList = (detailItem: GoodsDetailItem): Crowdfunding['supportList'] => {
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

const toGoodsList = (detailItem: GoodsDetailItem): NewProduct['goodsList'] =>
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
 * Convert a crowdfunding batch item and its goods detail into Crowdfunding template props.
 *
 * @param {CrowdfundingBatchListItem} listItem - Crowdfunding batch item.
 * @param {GoodsDetailItem} detailItem - Goods detail.
 * @returns {Crowdfunding} Crowdfunding template props.
 */
export const toCrowdfunding = (listItem: CrowdfundingBatchListItem, detailItem: GoodsDetailItem): Crowdfunding => ({
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
 * Convert a new product batch item and its goods detail into NewProduct template props.
 *
 * @param {NewProductBatchListItem} listItem - New product batch item.
 * @param {GoodsDetailItem} detailItem - Goods detail.
 * @returns {NewProduct} New product template props.
 */
export const toNewProduct = (listItem: NewProductBatchListItem, detailItem: GoodsDetailItem): NewProduct => ({
    image: detailItem.goodsInfo.imgHorizon,
    sellPointList: toSellPointList(detailItem.goodsInfo),
    goodsList: toGoodsList(detailItem),
});

export default {
    getCrowdfundingList,
    getCrowdfundingGid,
    getCrowdfundingName,
    getCrowdfundingImage,
    getNewProductList,
    getNewProductGid,
    getNewProductName,
    getNewProductImage,
    getNewProductFirstReleaseTime,
    getCrowdfundingItem,
    getNewProductItem,
    toCrowdfunding,
    toNewProduct,
};
