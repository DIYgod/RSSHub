interface DataResponse<Data> {
    data: Data;
}

// Homepage

export type HomepageMainResponse = DataResponse<{
    homepage: {
        floors: Array<{
            data: {
                items: Array<{
                    item: {
                        jump_url: string;
                        title: string;
                    };
                }>;
            };
            module_key: string;
        }>;
    };
}>;

// Venuepage

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

// ListItem

export interface VenueGoodsBatchItem {
    type: string;
    value: {
        goods: {
            fist_release_time: number;
            gid: number;
            img_square: string;
            name: string;
        };
    };
}

export interface VenueBannerBatchItem {
    gid: number;
    new_product_name: string;
    picture_url: string;
}

export type NewProductBatchListItem = VenueGoodsBatchItem | VenueBannerBatchItem;

export interface VenueReservationBatchItem {
    gid?: number;
    goodsInfo: {
        img_square: string;
        name: string;
    };
}

export type CrowdfundingBatchListItem = VenueGoodsBatchItem | VenueReservationBatchItem;

// BatchResult

interface VenueBatchListResult<Item> {
    list: Item[];
}

export type VenueBatchResponse<Result> = DataResponse<{
    result_list: Result[];
}>;

export type CrowdfundingBatchResult = VenueBatchListResult<CrowdfundingBatchListItem> | VenueReservationBatchItem;

export type NewProductBatchResult = VenueBatchListResult<NewProductBatchListItem>;

// GoodsDetail

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
    productInfo: Record<
        string,
        {
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
    >;
}

export type GoodsDetailResponse = DataResponse<{
    goods: GoodsDetailItem;
}>;
