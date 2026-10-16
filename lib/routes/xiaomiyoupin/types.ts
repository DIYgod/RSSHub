interface DataResponse<Data> {
    data: Data;
}

export interface HomepageFloor {
    module_key: string;
    data: {
        jump_url?: string;
        pic_jump_url?: string;
    };
}

export type HomepageMainResponse = DataResponse<{
    homepage: {
        floors: HomepageFloor[];
    };
}>;

export interface VenueQuery {
    resolver: string;
    sign: string;
    parameter: string;
}

export type VenuePageResponse = DataResponse<{
    floors: Array<{
        module_key: string;
        query_list: VenueQuery[];
    }>;
}>;

export interface VenueGoods {
    gid: number;
    name: string;
    jump_url: string;
    img_square: string;
    img800s: string;
    img_horizon: string;
    fist_release_time: number;
    first_release_time: number;
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
    jump_url: string;
    picture_url: string;
    new_product_name: string;
    new_product_desc: string;
}

export type NewProductBatchListItem = VenueGoodsBatchItem | VenueBannerBatchItem;

// 众筹 reservation 预约项；gid / goodsInfo 仅在预约已关联具体商品时存在，用于过滤
export interface VenueReservationContent {
    titleConfig: {
        titleText: string;
    };
    goodImageConfig: {
        goodImage: string;
    };
    online: {
        jumpUrl: string;
    };
    notGidJump: string;
}

export interface VenueReservationGoods {
    gid: number;
    name: string;
    jump_url: string;
    img_square: string;
    img800s: string;
    img_horizon: string;
    fist_release_time: number;
}

export interface VenueReservationBatchItem {
    content: VenueReservationContent;
    gid?: number | null;
    goodsInfo?: VenueReservationGoods;
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    goodsType: number;
    orderCount: number;
    ordered: boolean;
    status: number;
}

export type CrowdfundingBatchListItem = VenueGoodsBatchItem | VenueReservationBatchItem;

export interface VenueBatchListResult<Item> {
    list: Item[];
}

export type CrowdfundingBatchResponse = DataResponse<{
    result_list: Array<VenueBatchListResult<CrowdfundingBatchListItem> | VenueReservationBatchItem>;
}>;

export type NewProductBatchResponse = DataResponse<{
    result_list: Array<VenueBatchListResult<NewProductBatchListItem>>;
}>;

export interface GoodsListItem {
    gid: number;
    name: string;
    jumpUrl: string;
    image: string;
    firstReleaseTime?: number;
}

export interface ProductInfoItem {
    pid: number;
    name: string;
    summary: string;
    marketPrice: number;
    price: number;
    img800s: string;
    img: string;
    picURL: string;
}

export interface GoodsDetailItem {
    goodsInfo: {
        name: string;
        summary: string;
        firstSellPoint: string;
        secondSellPoint: string;
        thirdSellPoint: string;
        priceMin: number;
        marketPrice: number;
        imgSquare: string;
        img800s: string;
        firstTime: number;
        scheduleOnSaleTime: number;
    };
    productInfo: Record<string, ProductInfoItem>;
    crowdFunding: {
        startTime: number;
        endTime: number;
        estimateSendtime: number;
        progress: number;
        saledCount: number;
    };
    oneYuanSupport: {
        groupBuyInfo: {
            good: {
                name: string;
                img: string;
                groupbuy_price: number;
                groupbuy_summary: string;
            };
        };
    };
}

export type GoodsDetailResponse = DataResponse<{
    goods: GoodsDetailItem;
}>;
