import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import NotFoundError from '@/errors/types/not-found';
import type { Crowdfunding } from '@/routes/mi/templates/crowdfunding';
import type { NewProduct } from '@/routes/mi/templates/newproduct';
import ofetch from '@/utils/ofetch';

import type { GoodsDetailItem, GoodsDetailResponse, GoodsListItem, HomepageMainResponse, VenueBatchListItem, VenueBatchResponse, VenueGoods, VenuePageResponse, VenueQuery } from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const parsePageQuery = (url?: string): { pageId: string; sign: string } => {
    let searchParams: URLSearchParams | undefined;
    try {
        searchParams = url ? new URL(url).searchParams : undefined;
    } catch {
        searchParams = undefined;
    }
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
    const queryList: VenueQuery[] = [];
    for (const floor of response.data.floors) {
        const floorQueries = floor.query_list ?? [];
        for (const query of floorQueries) {
            if (resolvers.includes(query.resolver)) {
                queryList.push(query);
            }
        }
    }
    return queryList;
};

const getVenueBatchList = async (pageId: string, sign: string, queryList: VenueQuery[]): Promise<VenueBatchListItem[]> => {
    const response = await ofetch<VenueBatchResponse>('https://m.xiaomiyoupin.com/mtop/navi/venue/batch', {
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
    return response.data.result_list.flatMap((result) => result.list ?? []);
};

const isVenueGoodsItem = (item: VenueBatchListItem): item is Extract<VenueBatchListItem, { value: { goods: VenueGoods } }> => 'value' in item && 'goods' in item.value;

const toGoodsListItem = (item: VenueBatchListItem, resolver: string): GoodsListItem | undefined => {
    if (resolver === 'leek-super' && !isVenueGoodsItem(item)) {
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
    if (!isVenueGoodsItem(item)) {
        return undefined;
    }
    const goods = item.value.goods;
    if (!goods?.gid || !goods.name) {
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

const getGoodsFromVenue = async (moduleKey: string, resolvers: string[]): Promise<GoodsListItem[]> => {
    const { pageId, sign } = await getVenueQueryContext(moduleKey);
    const queryList = await getVenuePageQueryList(pageId, sign, resolvers);
    const batchList = await getVenueBatchList(pageId, sign, queryList);
    const items: GoodsListItem[] = [];
    for (const [index, item] of batchList.entries()) {
        const resolver = queryList[index]?.resolver ?? '';
        const goodsItem = toGoodsListItem(item, resolver);
        if (goodsItem) {
            items.push(goodsItem);
        }
    }
    const list = Map.groupBy(items, (item) => item.gid)
        .values()
        .toArray()
        .map((group) => group[0]);
    return list;
};

export const getCrowdfundingList = (): Promise<GoodsListItem[]> => getGoodsFromVenue('crowd_funding', ['crowd-funding']);

export const getNewProductList = (): Promise<GoodsListItem[]> => getGoodsFromVenue('product_hot', ['leek-super', 'leek-selective']);

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

export const getCrowdfundingItem = (item: GoodsListItem): Promise<GoodsDetailItem> => getGoodsItem(item.gid);

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

export const toCrowdfunding = (listItem: GoodsListItem, detailItem: GoodsDetailItem): Crowdfunding => ({
    image: detailItem.goodsInfo.imgSquare || listItem.image,
    sellPointList: toSellPointList(detailItem.goodsInfo),
    sellPoint: detailItem.goodsInfo.summary,
    price: String((detailItem.goodsInfo.priceMin ?? 0) / 100),
    marketPrice: String((detailItem.goodsInfo.marketPrice ?? 0) / 100),
    startTime: new Date((detailItem.crowdFunding?.startTime || listItem.firstReleaseTime || 0) * 1000),
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
    getNewProductList,
    getCrowdfundingItem,
    getNewProductItem,
    toCrowdfunding,
    toNewProduct,
};
