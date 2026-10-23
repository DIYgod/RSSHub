import { z } from 'zod';

// Response schemas mirror the upstream JSON shape, which nests deeper than the lint limit allows.
// oxlint-disable unicorn/max-nested-calls

const DataResponseSchema = <Schema extends z.ZodType>(data: Schema) => z.object({ data });

// NewProduct

const NewProductListGoodsSchema = z.object({
    img800s: z.string(),
    itemId: z.number(),
    name: z.string(),
    startTime: z.number().optional(),
});

// The route always normalizes `startTime` with the floor start time before building items.
export type NewProductListItem = z.infer<typeof NewProductListGoodsSchema> & { startTime: number };

export const NewProductListResponseSchema = DataResponseSchema(
    z.object({
        floors: z.array(
            z.object({
                dynamicData: z
                    .array(
                        z.object({
                            list: z.array(
                                z.object({
                                    type: z.string(),
                                    value: z.object({
                                        goods: NewProductListGoodsSchema,
                                    }),
                                })
                            ),
                        })
                    )
                    .optional(),
                moduleKey: z.string(),
                startTime: z.number(),
            })
        ),
    })
);

const NewProductDetailGoodsSchema = z.object({
    imgUrl: z.string(),
    marketPrice: z.string(),
    name: z.string(),
    price: z.string(),
});

const NewProductDetailItemSchema = z.object({
    batchedInfoMap: z
        .record(
            z.string(),
            z.object({
                batchedSsuList: z.array(NewProductDetailGoodsSchema),
            })
        )
        .optional(),
    batchedSsuList: z.array(NewProductDetailGoodsSchema),
    goodsInfo: z.object({
        goodsList: z.array(NewProductDetailGoodsSchema),
    }),
    product: z.object({
        sellPointList: z.array(z.string()),
    }),
});

export type NewProductDetailItem = z.infer<typeof NewProductDetailItemSchema>;

export const NewProductDetailResponseSchema = DataResponseSchema(NewProductDetailItemSchema);
