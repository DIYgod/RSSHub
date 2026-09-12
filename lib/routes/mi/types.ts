interface DataResponse<Data> {
    data: Data;
}

// Crowdfunding

export interface CrowdfundingListItem {
    img_url: string;
    product_market_price: string;
    product_name: string;
    project_id: number;
}

export type CrowdfundingListResponse = DataResponse<{
    list: Array<{
        items: CrowdfundingListItem[];
    }>;
}>;

export interface CrowdfundingDetailItem {
    big_image: string;
    end_time: number;
    price: string;
    project_desc: string;
    send_info: string;
    start_time: number;
    support_list: Array<{
        goods_list: Array<{
            goods_image: string;
        }>;
        name: string;
        price: string;
        support_desc: string;
    }>;
}

export type CrowdfundingDetailResponse = DataResponse<{
    crowd_funding_info: CrowdfundingDetailItem;
}>;

// NewProduct

export interface NewProductListItem {
    img: string;
    product_id: number;
    product_name: string;
    start_time: number;
}

export type NewProductListResponse = DataResponse<{
    date_list: Array<{
        product_list: NewProductListItem[];
    }>;
    history_date_list: Array<{
        product_list: NewProductListItem[];
    }>;
    new_list: NewProductListItem[];
}>;

export interface NewProductDetailItem {
    goodsInfo: {
        goodsList: NewProductGoods[];
    };
    product: {
        sellPointList: string[];
    };
    relationBatchedInfo?: {
        relationBatchedList: Array<{
            goodsInfo: NewProductGoods[];
        }>;
    };
}

interface NewProductGoods {
    imgUrl: string;
    marketPrice: string;
    name: string;
    price: string;
}

export type NewProductDetailResponse = DataResponse<NewProductDetailItem>;
