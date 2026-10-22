import { z } from 'zod';

// Response schemas mirror the upstream JSON shape, which nests deeper than the lint limit allows.
// oxlint-disable unicorn/max-nested-calls

const DataResponseSchema = <Schema extends z.ZodType>(data: Schema) => z.object({ data });

// Crowdfunding

const CrowdfundingListItemSchema = z.object({
    img_url_small: z.string(),
    product_market_price: z.string(),
    product_name: z.string(),
    project_id: z.number(),
});

export type CrowdfundingListItem = z.infer<typeof CrowdfundingListItemSchema>;

export const CrowdfundingListResponseSchema = DataResponseSchema(
    z.object({
        list: z.array(
            z.object({
                items: z.array(CrowdfundingListItemSchema),
            })
        ),
    })
);

const CrowdfundingDetailItemSchema = z.object({
    big_image: z.string(),
    end_time: z.number(),
    price: z.string(),
    project_desc: z.string(),
    send_info: z.string(),
    start_time: z.number(),
    support_list: z.array(
        z.object({
            goods_list: z.array(
                z.object({
                    goods_image: z.string(),
                })
            ),
            name: z.string(),
            price: z.string(),
            support_desc: z.string(),
        })
    ),
});

export type CrowdfundingDetailItem = z.infer<typeof CrowdfundingDetailItemSchema>;

export const CrowdfundingDetailResponseSchema = DataResponseSchema(
    z.object({
        crowd_funding_info: CrowdfundingDetailItemSchema,
    })
);

// NewProduct

const NewProductListItemSchema = z.object({
    img: z.string(),
    product_id: z.number(),
    product_name: z.string(),
    start_time: z.number(),
});

export type NewProductListItem = z.infer<typeof NewProductListItemSchema>;

export const NewProductListResponseSchema = DataResponseSchema(
    z.object({
        date_list: z.array(
            z.object({
                product_list: z.array(NewProductListItemSchema),
            })
        ),
        history_date_list: z.array(
            z.object({
                product_list: z.array(NewProductListItemSchema),
            })
        ),
        new_list: z.array(NewProductListItemSchema),
    })
);

const NewProductGoodsSchema = z.object({
    imgUrl: z.string(),
    marketPrice: z.string(),
    name: z.string(),
    price: z.string(),
});

const NewProductDetailItemSchema = z.object({
    goodsInfo: z.object({
        goodsList: z.array(NewProductGoodsSchema),
    }),
    product: z.object({
        sellPointList: z.array(z.string()),
    }),
    relationBatchedInfo: z
        .object({
            relationBatchedList: z.array(
                z.object({
                    goodsInfo: z.array(NewProductGoodsSchema),
                })
            ),
        })
        .optional(),
});

export type NewProductDetailItem = z.infer<typeof NewProductDetailItemSchema>;

export const NewProductDetailResponseSchema = DataResponseSchema(NewProductDetailItemSchema);
