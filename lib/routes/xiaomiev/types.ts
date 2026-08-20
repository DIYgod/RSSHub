export interface DetailBatchedInfo {
    batchedSsuList: DetailGoods[];
}

export interface DetailData {
    batchedInfoMap?: Record<string, DetailBatchedInfo>;
    batchedSsuList: DetailGoods[];
    goodsInfo: {
        goodsList: DetailGoods[];
    };
    product: DetailProduct;
}

export interface DetailGoods {
    imgUrl: string;
    marketPrice: string;
    name: string;
    price: string;
}

export interface DetailProduct {
    productId: number;
    sellPointList: string[];
}

export interface DetailResponse {
    data: DetailData;
}

export interface Floor {
    dynamicData?: FloorDynamicData[];
    moduleKey: string;
}

export interface FloorDynamicData {
    list: FloorListItem[];
}

export interface FloorListItem {
    type: string;
    value: FloorListItemValue;
}

export interface FloorListItemValue {
    goods: Goods;
}

export interface Goods {
    img800s: string;
    itemId: number;
    name: string;
}

export interface ListData {
    floors: Floor[];
}

export interface ListResponse {
    data: ListData;
}
