export interface DataResponse<Data> {
    data: Data;
}

export interface CrowdfundingData {
    list: CrowdfundingList[];
}

interface CrowdfundingList {
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
    send_info: string;
    start_time: number;
    support_list: CrowdfundingDetailSupportList[];
}

interface CrowdfundingDetailSupportList {
    goods_list: CrowdfundingGoods[];
    name: string;
    price: string;
    support_desc: string;
}

interface CrowdfundingGoods {
    goods_image: string;
}

export interface NewProductListData {
    date_list: NewProductDateGroup[];
    history_date_list: NewProductDateGroup[];
    new_list: NewProductItem[];
}

interface NewProductDateGroup {
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

interface NewProductDetail {
    sellPointList: string[];
}

interface NewProductGoods {
    imgUrl: string;
    marketPrice: string;
    name: string;
    price: string;
}

interface NewProductRelationBatched {
    goodsInfo: NewProductGoods[];
}
