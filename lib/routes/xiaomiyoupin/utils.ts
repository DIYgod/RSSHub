import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import NotFoundError from '@/errors/types/not-found';
import type { Crowdfunding } from '@/routes/mi/templates/crowdfunding';
import type { NewProduct } from '@/routes/mi/templates/newproduct';
import ofetch from '@/utils/ofetch';

import type {
    CrowdfundingBatchListItem,
    CrowdfundingBatchResponse,
    GoodsDetailItem,
    GoodsDetailResponse,
    GoodsListItem,
    HomepageMainResponse,
    NewProductBatchListItem,
    NewProductBatchResponse,
    VenueGoodsBatchItem,
    VenuePageResponse,
    VenueQuery,
    VenueReservationBatchItem,
} from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

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

export const getCrowdfundingGid = (item: CrowdfundingBatchListItem): number => {
    if (isVenueGoodsBatchItem(item)) {
        return item.value.goods.gid;
    }
    return item.gid!;
};

export const getCrowdfundingName = (item: CrowdfundingBatchListItem): string => {
    if (isVenueGoodsBatchItem(item)) {
        return item.value.goods.name;
    }
    return item.goodsInfo.name;
};

export const getCrowdfundingImage = (item: CrowdfundingBatchListItem): string => {
    if (isVenueGoodsBatchItem(item)) {
        const goods = item.value.goods;
        return goods.img_square;
    }
    return item.goodsInfo.img_square;
};

const getCrowdfundingFirstReleaseTime = (item: CrowdfundingBatchListItem): number | undefined => {
    if (isVenueGoodsBatchItem(item)) {
        return item.value.goods.fist_release_time || item.value.goods.first_release_time;
    }
    return item.goodsInfo?.fist_release_time;
};

const dedupeByGid = <Item>(items: Item[], getGid: (item: Item) => number): Item[] => {
    const list = Map.groupBy(items, (item) => getGid(item))
        .values()
        .toArray()
        .map((group) => group[0]);
    return list;
};

const getCrowdfundingBatchList = async (pageId: string, sign: string, queryList: VenueQuery[]): Promise<CrowdfundingBatchListItem[]> => {
    const response = await ofetch<CrowdfundingBatchResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
        method: 'POST',
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
        body: {
            query_list: queryList,
        },
    });
    const list = response.data.result_list.flatMap((result): CrowdfundingBatchListItem[] => {
        if ('list' in result) {
            return result.list.filter((item): item is VenueGoodsBatchItem => isVenueGoodsBatchItem(item) && item.type === 'goods');
        }
        if (result.gid === undefined || result.gid === null) {
            return [];
        }
        return [result];
    });
    return list;
};

const toGoodsListItem = (item: NewProductBatchListItem, resolver: string): GoodsListItem | undefined => {
    if (resolver === 'leek-super' && !isVenueGoodsBatchItem(item)) {
        if (!item.gid || !item.new_product_name) {
            return undefined;
        }
        return {
            gid: item.gid,
            name: item.new_product_name,
            jumpUrl: item.jump_url,
            image: item.picture_url,
        };
    }
    if (!isVenueGoodsBatchItem(item)) {
        return undefined;
    }
    const goods = item.value.goods;
    if (!goods.gid || !goods.name) {
        return undefined;
    }
    return {
        gid: goods.gid,
        name: goods.name,
        jumpUrl: goods.jump_url,
        image: goods.img_square || goods.img800s || goods.img_horizon,
        firstReleaseTime: goods.fist_release_time || goods.first_release_time,
    };
};

const getNewProductBatchList = async (pageId: string, sign: string, queryList: VenueQuery[]): Promise<NewProductBatchListItem[]> => {
    const response = await ofetch<NewProductBatchResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
        method: 'POST',
        query: {
            page_id: pageId,
            pdl: 'jianyu',
            sign,
        },
        body: {
            query_list: queryList,
        },
    });
    const list = response.data.result_list.flatMap((result) => result.list);
    return list;
};

export const getCrowdfundingList = async (): Promise<CrowdfundingBatchListItem[]> => {
    const { pageId, sign } = await getVenueQueryContext('crowd_funding');
    const queryList = await getVenuePageQueryList(pageId, sign, ['crowd-funding', 'reservation']);
    const batchList = await getCrowdfundingBatchList(pageId, sign, queryList);
    const list = dedupeByGid(batchList, (item) => getCrowdfundingGid(item));
    return list;
};

const getNewProductFromVenue = async (): Promise<GoodsListItem[]> => {
    const { pageId, sign } = await getVenueQueryContext('product_hot');
    const queryList = await getVenuePageQueryList(pageId, sign, ['leek-super', 'leek-selective']);
    const batchList = await getNewProductBatchList(pageId, sign, queryList);
    const items = batchList.map((item, index) => toGoodsListItem(item, queryList[index]?.resolver ?? '')).filter((item): item is GoodsListItem => item !== undefined);
    const list = dedupeByGid(items, (item) => item.gid);
    return list;
};

export const getNewProductList = (): Promise<GoodsListItem[]> => getNewProductFromVenue();

const getGoodsItem = async (gid: number): Promise<GoodsDetailItem> => {
    const response = await ofetch<GoodsDetailResponse>('https://m.xiaomiyoupin.com/api/gateway/detail', {
        method: 'POST',
        body: {
            groupName: 'details',
            groupParams: [[String(gid)]],
            methods: [],
            version: '1.0.0',
            debug: false,
            channel: '',
            vipMode: true,
            system: '2',
        },
    });
    return response.data.goods;
};

export const getCrowdfundingItem = (item: CrowdfundingBatchListItem): Promise<GoodsDetailItem> => getGoodsItem(getCrowdfundingGid(item));

export const getNewProductItem = (item: GoodsListItem): Promise<GoodsDetailItem> => getGoodsItem(item.gid);

const toSellPointList = (goodsInfo: GoodsDetailItem['goodsInfo']): string[] =>
    [goodsInfo.firstSellPoint, goodsInfo.secondSellPoint, goodsInfo.thirdSellPoint].map((point) => point?.trim()).filter((point): point is string => Boolean(point));

const toSupportList = (detailItem: GoodsDetailItem): Crowdfunding['supportList'] => {
    const supportList = Object.values(detailItem.productInfo ?? {}).map((product) => ({
        image: product.img800s || product.img || product.picURL,
        name: product.name,
        price: String((product.price ?? 0) / 100),
        description: product.summary,
    }));
    const groupBuyGood = detailItem.oneYuanSupport?.groupBuyInfo?.good;
    if (groupBuyGood) {
        supportList.push({
            image: groupBuyGood.img,
            name: groupBuyGood.name || '1元支持',
            price: String((groupBuyGood.groupbuy_price ?? 0) / 100),
            description: groupBuyGood.groupbuy_summary,
        });
    }
    return supportList;
};

export const toCrowdfunding = (listItem: CrowdfundingBatchListItem, detailItem: GoodsDetailItem): Crowdfunding => ({
    image: detailItem.goodsInfo.imgSquare || getCrowdfundingImage(listItem),
    sellPointList: toSellPointList(detailItem.goodsInfo),
    sellPoint: detailItem.goodsInfo.summary,
    price: String((detailItem.goodsInfo.priceMin ?? 0) / 100),
    marketPrice: String((detailItem.goodsInfo.marketPrice ?? 0) / 100),
    startTime: new Date((detailItem.crowdFunding?.startTime || getCrowdfundingFirstReleaseTime(listItem) || 0) * 1000),
    endTime: new Date((detailItem.crowdFunding?.endTime || 0) * 1000),
    sendInfo: detailItem.crowdFunding?.estimateSendtime
        ? `预计 ${dayjs(detailItem.crowdFunding.estimateSendtime * 1000)
              .tz('Asia/Shanghai')
              .locale('zh-cn')
              .format('lll')} 前发货`
        : '',
    supportList: toSupportList(detailItem),
});

export const toNewProduct = (listItem: GoodsListItem, detailItem: GoodsDetailItem): NewProduct => ({
    image: detailItem.goodsInfo.imgSquare || listItem.image,
    sellPointList: toSellPointList(detailItem.goodsInfo),
    goodsList: Object.values(detailItem.productInfo ?? {}).map((product) => ({
        image: product.img800s || product.img || product.picURL,
        name: product.name,
        marketPrice: String((product.marketPrice ?? 0) / 100),
        price: String((product.price ?? 0) / 100),
    })),
});

export default {
    getCrowdfundingList,
    getCrowdfundingGid,
    getCrowdfundingName,
    getCrowdfundingImage,
    getNewProductList,
    getCrowdfundingItem,
    getNewProductItem,
    toCrowdfunding,
    toNewProduct,
};
