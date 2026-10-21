interface DataResponse<Data> {
    data: Data;
}

export interface HomepageFloor {
    data: {
        items: Array<{
            item: {
                jump_url: string;
                title: string;
            };
        }>;
    };
    module_key: string;
}

export type HomepageMainResponse = DataResponse<{
    homepage: {
        floors: HomepageFloor[];
    };
}>;

export interface VenueQuery {
    parameter: string;
    resolver: string;
    sign: string;
}

export type VenuePageResponse = DataResponse<{
    floors: Array<{
        query_list: VenueQuery[];
    }>;
}>;

export interface VenueGoods {
    fist_release_time: number;
    gid: number;
    img_square: string;
    name: string;
}

// 众筹与上新共用的 venue batch 商品项
export interface VenueGoodsBatchItem {
    type: string;
    value: {
        goods: VenueGoods;
    };
}

// 上新 leek-super 轮播 banner 项
export interface VenueBannerBatchItem {
    gid: number;
    new_product_name: string;
    picture_url: string;
}

export type NewProductBatchListItem = VenueGoodsBatchItem | VenueBannerBatchItem;

export interface VenueReservationGoods {
    img_square: string;
    name: string;
}

export interface VenueReservationBatchItem {
    gid?: number;
    goodsInfo: VenueReservationGoods;
}

export type CrowdfundingBatchListItem = VenueGoodsBatchItem | VenueReservationBatchItem;

export interface VenueBatchListResult<Item> {
    list: Item[];
}

export type VenueBatchResponse<Result> = DataResponse<{
    result_list: Result[];
}>;

export type CrowdfundingBatchResult = VenueBatchListResult<CrowdfundingBatchListItem> | VenueReservationBatchItem;

export type NewProductBatchResult = VenueBatchListResult<NewProductBatchListItem>;

export interface ProductInfoItem {
    attributeValues: string[];
    img: string;
    marketPrice: number;
    name: string;
    onHandPrice?: Array<{
        price: number;
    }>;
    price: number;
    singlePrice?: Array<{
        price: number;
    }>;
}

export interface GoodsDetailItem {
    crowdFunding: {
        endTime: number;
        estimateSendtime: number;
        startTime: number;
    };
    goodsInfo: {
        firstSellPoint: string;
        imgHorizon: string;
        pids: number[];
        secondSellPoint: string;
        thirdSellPoint: string;
    };
    oneYuanSupport: {
        groupBuyInfo?: {
            good: {
                groupbuy_price: number;
                groupbuy_summary: string;
                img: string;
            };
        };
    };
    priceInfo: {
        priceInfo: {
            marketPrice: number;
            onHandPrice?: {
                price: number;
            };
        };
    };
    productInfo: Record<string, ProductInfoItem>;
}

export type GoodsDetailResponse = DataResponse<{
    goods: GoodsDetailItem;
}>;
