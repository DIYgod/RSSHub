export interface DataResponse<Data> {
    data: Data;
}

export interface CrowdfundingData {
    list: CrowdfundingList[];
}

export interface CrowdfundingList {
    items: CrowdfundingItem[];
}

export interface CrowdfundingItem {
    img_url: string;
    product_market_price: string;
    product_name: string;
    project_id: number;
}

export interface CrowdfundingDetailData {
    crowd_funding_info: CrowdfundingDetailInfo;
}

export interface CrowdfundingDetailInfo {
    big_image: string;
    end_time: number;
    price: string;
    project_desc: string;
    project_id: number;
    send_info: string;
    start_time: number;
    support_list: CrowdfundingDetailSupportList[];
}

export interface CrowdfundingDetailSupportList {
    goods_list: CrowdfundingGoods[];
    name: string;
    price: string;
    support_desc: string;
}

export interface CrowdfundingGoods {
    goods_image: string;
}

export interface NewProductListData {
    date_list: NewProductDateGroup[];
    history_date_list: NewProductDateGroup[];
    new_list: NewProductItem[];
}

export interface NewProductDateGroup {
    product_list: NewProductItem[];
}

export interface NewProductItem {
    img: string;
    product_id: number;
    product_name: string;
    start_time: number;
}

export interface NewProductDetailData {
    goodsInfo: {
        goodsList: NewProductGoods[];
    };
    product: NewProductDetail;
    relationBatchedInfo?: {
        relationBatchedList: NewProductRelationBatched[];
    };
}

export interface NewProductDetail {
    productId: number;
    sellPointList: string[];
}

export interface NewProductGoods {
    imgUrl: string;
    marketPrice: string;
    name: string;
    price: string;
}

export interface NewProductRelationBatched {
    goodsInfo: NewProductGoods[];
}
