interface DataResponse<Data> {
    data: Data;
}

export interface NewProductListItem {
    img800s: string;
    itemId: number;
    name: string;
}

export type NewProductListResponse = DataResponse<{
    floors: Array<{
        dynamicData?: Array<{
            list: Array<{
                type: string;
                value: {
                    goods: NewProductListItem;
                };
            }>;
        }>;
        moduleKey: string;
    }>;
}>;

interface NewProductDetailGoods {
    imgUrl: string;
    marketPrice: string;
    name: string;
    price: string;
}

export interface NewProductDetailItem {
    batchedInfoMap?: Record<string, { batchedSsuList: NewProductDetailGoods[] }>;
    batchedSsuList: NewProductDetailGoods[];
    goodsInfo: {
        goodsList: NewProductDetailGoods[];
    };
    product: {
        productId: number;
        sellPointList: string[];
    };
}

export type NewProductDetailResponse = DataResponse<NewProductDetailItem>;
