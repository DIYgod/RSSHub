export interface DataResponse<Data> {
    data: Data;
}

export interface Goods {
    img800s: string;
    itemId: number;
    name: string;
}

export type ListResponse = DataResponse<{
    floors: Array<{
        dynamicData?: Array<{
            list: Array<{
                type: string;
                value: {
                    goods: Goods;
                };
            }>;
        }>;
        moduleKey: string;
    }>;
}>;

export interface DetailGoods {
    imgUrl: string;
    marketPrice: string;
    name: string;
    price: string;
}

export interface DetailData {
    batchedInfoMap?: Record<string, { batchedSsuList: DetailGoods[] }>;
    batchedSsuList: DetailGoods[];
    goodsInfo: {
        goodsList: DetailGoods[];
    };
    product: {
        productId: number;
        sellPointList: string[];
    };
}

export type DetailResponse = DataResponse<DetailData>;
