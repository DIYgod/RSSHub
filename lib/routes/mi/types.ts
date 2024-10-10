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
    project_id: number;
    product_market_price: string;
}

export interface CrowdfundingDetailData {
    crowd_funding_info: CrowdfundingDetailInfo;
}

export interface CrowdfundingDetailInfo {
    big_image: string;
    end_time: number;
    end_time_desc: string; // injected
    price: string;
    product_market_price: string; // injected
    project_desc: string;
    project_id: number;
    project_name: string;
    start_time: number;
    start_time_desc: string; // injected
    support_list: CrowdfundingDetailSupportList[];
}

export interface CrowdfundingDetailSupportList {
    name: string;
    price: string;
    support_desc: string;
}
