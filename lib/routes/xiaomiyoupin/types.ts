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
        data: {
            start_time: number;
        };
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

export type VenueBatchListItem =
    | {
          value: {
              goods: VenueGoods;
          };
      }
    | {
          gid: number;
          jump_url: string;
          picture_url: string;
          new_product_name: string;
          new_product_desc: string;
      };

export type VenueBatchResponse = DataResponse<{
    result_list: Array<{
        list: VenueBatchListItem[];
    }>;
}>;

export interface GoodsListItem {
    gid: number;
    name: string;
    jumpUrl: string;
    image: string;
    firstReleaseTime: number;
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
