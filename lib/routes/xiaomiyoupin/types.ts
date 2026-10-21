interface DataResponse<Data> {
    data: Data;
}

interface HomepageFloor {
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

interface VenueGoods {
    fist_release_time: number;
    gid: number;
    img_square: string;
    name: string;
}

export interface VenueGoodsBatchItem {
    type: string;
    value: {
        goods: VenueGoods;
    };
}

export interface VenueBannerBatchItem {
    gid: number;
    new_product_name: string;
    picture_url: string;
}

export type NewProductBatchListItem = VenueGoodsBatchItem | VenueBannerBatchItem;

interface VenueReservationGoods {
    img_square: string;
    name: string;
}

export interface VenueReservationBatchItem {
    gid?: number;
    goodsInfo: VenueReservationGoods;
}

export type CrowdfundingBatchListItem = VenueGoodsBatchItem | VenueReservationBatchItem;

interface VenueBatchListResult<Item> {
    list: Item[];
}

export type VenueBatchResponse<Result> = DataResponse<{
    result_list: Result[];
}>;

export type CrowdfundingBatchResult = VenueBatchListResult<CrowdfundingBatchListItem> | VenueReservationBatchItem;

export type NewProductBatchResult = VenueBatchListResult<NewProductBatchListItem>;

interface ProductInfoItem {
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
