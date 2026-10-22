import { z } from 'zod';

// Crowdfunding

const CrowdfundingListItemSchema = z.object({
    img_url: z.string(),
    product_market_price: z.string(),
    product_name: z.string(),
    project_id: z.number(),
});

export type CrowdfundingListItem = z.infer<typeof CrowdfundingListItemSchema>;

const CrowdfundingListGroupSchema = z.object({
    items: z.array(CrowdfundingListItemSchema),
});

export const CrowdfundingListResponseSchema = z.object({
    data: z.object({
        list: z.array(CrowdfundingListGroupSchema),
    }),
});

export type CrowdfundingListResponse = z.infer<typeof CrowdfundingListResponseSchema>;

const CrowdfundingTierGoodsSchema = z.object({
    goods_image: z.string(),
});

const CrowdfundingSupportSchema = z.object({
    goods_list: z.array(CrowdfundingTierGoodsSchema),
    name: z.string(),
    price: z.string(),
    support_desc: z.string(),
});

const CrowdfundingDetailItemSchema = z.object({
    big_image: z.string(),
    end_time: z.number(),
    price: z.string(),
    project_desc: z.string(),
    send_info: z.string(),
    start_time: z.number(),
    support_list: z.array(CrowdfundingSupportSchema),
});

export type CrowdfundingDetailItem = z.infer<typeof CrowdfundingDetailItemSchema>;

export const CrowdfundingDetailResponseSchema = z.object({
    data: z.object({
        crowd_funding_info: CrowdfundingDetailItemSchema,
    }),
});

export type CrowdfundingDetailResponse = z.infer<typeof CrowdfundingDetailResponseSchema>;

// NewProduct

const NewProductListItemSchema = z.object({
    img: z.string(),
    product_id: z.number(),
    product_name: z.string(),
    start_time: z.number(),
});

export type NewProductListItem = z.infer<typeof NewProductListItemSchema>;

const NewProductDateGroupSchema = z.object({
    product_list: z.array(NewProductListItemSchema),
});

export const NewProductListResponseSchema = z.object({
    data: z.object({
        date_list: z.array(NewProductDateGroupSchema),
        history_date_list: z.array(NewProductDateGroupSchema),
        new_list: z.array(NewProductListItemSchema),
    }),
});

export type NewProductListResponse = z.infer<typeof NewProductListResponseSchema>;

const NewProductGoodsSchema = z.object({
    imgUrl: z.string(),
    marketPrice: z.string(),
    name: z.string(),
    price: z.string(),
});

const NewProductSellPointListSchema = z.array(z.string());

const NewProductRelationBatchedItemSchema = z.object({
    goodsInfo: z.array(NewProductGoodsSchema),
});

const NewProductRelationBatchedInfoSchema = z.object({
    relationBatchedList: z.array(NewProductRelationBatchedItemSchema),
});

const NewProductDetailItemSchema = z.object({
    goodsInfo: z.object({
        goodsList: z.array(NewProductGoodsSchema),
    }),
    product: z.object({
        sellPointList: NewProductSellPointListSchema,
    }),
    relationBatchedInfo: NewProductRelationBatchedInfoSchema.optional(),
});

export type NewProductDetailItem = z.infer<typeof NewProductDetailItemSchema>;

export const NewProductDetailResponseSchema = z.object({
    data: NewProductDetailItemSchema,
});

export type NewProductDetailResponse = z.infer<typeof NewProductDetailResponseSchema>;
