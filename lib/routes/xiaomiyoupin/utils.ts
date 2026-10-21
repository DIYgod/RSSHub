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
    CrowdfundingBatchResult,
    GoodsDetailItem,
    GoodsDetailResponse,
    HomepageMainResponse,
    NewProductBatchListItem,
    NewProductBatchResult,
    VenueBannerBatchItem,
    VenueBatchResponse,
    VenueGoodsBatchItem,
    VenuePageResponse,
    VenueQuery,
    VenueReservationBatchItem,
} from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const formatDate = (date: Date): string => dayjs(date).tz('Asia/Shanghai').locale('zh-cn').format('ll');

interface VenueQueryContext {
    pageId: string;
    sign: string;
    jumpUrl: string;
}

const parsePageQuery = (jumpUrl?: string): VenueQueryContext => {
    const searchParams = jumpUrl ? new URL(jumpUrl).searchParams : null;
    const pageId = searchParams?.get('pageid');
    const sign = searchParams?.get('sign');
    if (!jumpUrl || !pageId || !sign) {
        throw new NotFoundError('Failed to get pageid or sign from xiaomiyoupin homepage');
    }
    return { pageId, sign, jumpUrl };
};

const getVenueQueryContext = async (title: string): Promise<VenueQueryContext> => {
    const response = await ofetch<HomepageMainResponse>('https://m.xiaomiyoupin.com/homepage/main/v1005', {
        method: 'POST',
        query: {
            platform: 'm',
        },
        responseType: 'json',
    });
    const floor = response.data.homepage.floors.find((item) => item.module_key === 'kingkong_occupied');
    const jumpUrl = floor?.data.items.find((entry) => entry.item.title === title)?.item.jump_url;
    return parsePageQuery(jumpUrl);
};

const getVenuePageQueryList = async (pageId: string, sign: string, resolvers: string[]): Promise<VenueQuery[]> => {
    const response = await ofetch<VenuePageResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/page', {
        headers: {
            Accept: '*/*',
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
const getCrowdfundingGid = (item: CrowdfundingBatchListItem): number => (isVenueGoodsBatchItem(item) ? item.value.goods.gid : item.gid!);

/**
 * Read the goods name from a crowdfunding batch item.
 *
 * @param {CrowdfundingBatchListItem} item - Crowdfunding batch item.
 * @returns {string} Goods name.
 */
const getCrowdfundingName = (item: CrowdfundingBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.name : item.goodsInfo.name);

/**
 * Read the square image URL from a crowdfunding batch item.
 *
 * @param {CrowdfundingBatchListItem} item - Crowdfunding batch item.
 * @returns {string} Square image URL.
 */
const getCrowdfundingImage = (item: CrowdfundingBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.img_square : item.goodsInfo.img_square);

/**
 * Read the goods id from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {number} Goods id.
 */
const getNewProductGid = (item: NewProductBatchListItem): number => (isVenueGoodsBatchItem(item) ? item.value.goods.gid : item.gid);

/**
 * Read the goods name from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {string} Goods name.
 */
const getNewProductName = (item: NewProductBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.name : item.new_product_name);

/**
 * Read the square image URL from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {string} Square image URL.
 */
const getNewProductImage = (item: NewProductBatchListItem): string => (isVenueGoodsBatchItem(item) ? item.value.goods.img_square : item.picture_url);

/**
 * Read the first release timestamp from a new product batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {number | undefined} First release timestamp, or `undefined` when the item does not provide one.
 */
const getNewProductFirstReleaseTime = (item: NewProductBatchListItem): number | undefined => (isVenueGoodsBatchItem(item) ? item.value.goods.fist_release_time : undefined);

const getVenueBatchResultList = async <Result>(pageId: string, sign: string, queryList: VenueQuery[]): Promise<Result[]> => {
    const response = await ofetch<VenueBatchResponse<Result>>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
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
    return response.data.result_list;
};

/**
 * Fetch the new product list from the `kingkong_occupied` homepage floor named `上新精选`.
 *
 * @returns {Promise<{ list: NewProductBatchListItem[]; jumpUrl: string }>} Deduplicated new product batch items and the venue page URL.
 */
const getNewProductList = async (): Promise<{ list: NewProductBatchListItem[]; jumpUrl: string }> => {
    const { pageId, sign, jumpUrl } = await getVenueQueryContext('上新精选');
    const queryList = await getVenuePageQueryList(pageId, sign, ['leek-super', 'leek-selective']);
    const resultList = await getVenueBatchResultList<NewProductBatchResult>(pageId, sign, queryList);
    const batchList = resultList.flatMap((result) => result.list).filter((item): item is NewProductBatchListItem => isVenueGoodsTypeBatchItem(item) || isVenueBannerBatchItem(item));
    const list = dedupeByKey(batchList, (item) => getNewProductGid(item));
    return { list, jumpUrl };
};

/**
 * Fetch the crowdfunding list from the `kingkong_occupied` homepage floor named `小米众筹`.
 *
 * @returns {Promise<{ list: CrowdfundingBatchListItem[]; jumpUrl: string }>} Deduplicated crowdfunding batch items and the venue page URL.
 */
const getCrowdfundingList = async (): Promise<{ list: CrowdfundingBatchListItem[]; jumpUrl: string }> => {
    const { pageId, sign, jumpUrl } = await getVenueQueryContext('小米众筹');
    const queryList = await getVenuePageQueryList(pageId, sign, ['crowd-funding', 'reservation']);
    const resultList = await getVenueBatchResultList<CrowdfundingBatchResult>(pageId, sign, queryList);
    const batchList = resultList.flatMap((result): CrowdfundingBatchListItem[] => {
        if ('list' in result) {
            return result.list.filter((item): item is VenueGoodsBatchItem => isVenueGoodsTypeBatchItem(item));
        }
        if (result.gid === undefined || result.gid === null) {
            return [];
        }
        return [result];
    });
    const list = dedupeByKey(batchList, (item) => getCrowdfundingGid(item));
    return { list, jumpUrl };
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
const getCrowdfundingItem = (item: CrowdfundingBatchListItem): Promise<GoodsDetailItem> => getGoodsItem(getCrowdfundingGid(item));

/**
 * Fetch new product goods details by the goods id of a batch item.
 *
 * @param {NewProductBatchListItem} item - New product batch item.
 * @returns {Promise<GoodsDetailItem>} Goods detail.
 */
const getNewProductItem = (item: NewProductBatchListItem): Promise<GoodsDetailItem> => getGoodsItem(getNewProductGid(item));

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
const toCrowdfunding = (listItem: CrowdfundingBatchListItem, detailItem: GoodsDetailItem): Crowdfunding => ({
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
const toNewProduct = (listItem: NewProductBatchListItem, detailItem: GoodsDetailItem): NewProduct => ({
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
