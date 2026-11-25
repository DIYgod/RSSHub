import { z } from 'zod';

import { toSchemaItems } from '@/routes/mi/types';

// Response schemas mirror the upstream JSON shape, which nests deeper than the lint limit allows.
// oxlint-disable unicorn/max-nested-calls

const DataResponseSchema = <Schema extends z.ZodType>(data: Schema) => z.object({ data });

// NewProduct

// List

const NewProductListGoodsSchema = z.object({
    img800s: z.string(),
    itemId: z.number(),
    name: z.string(),
    startTime: z.number().optional(),
});

// The route always normalizes `startTime` with the floor start time before building items.
export type NewProductListItem = z.infer<typeof NewProductListGoodsSchema> & { startTime: number };

const NewProductListEntrySchema = z.object({
    type: z.literal('goods'),
    value: z.object({
        goods: NewProductListGoodsSchema,
    }),
});

const NewProductFloorSchema = z.object({
    dynamicData: z
        .array(
            z.object({
                // Entries of other types are skipped.
                list: z.array(z.unknown()).transform((list) => toSchemaItems(list, NewProductListEntrySchema)),
            })
        )
        .optional(),
    moduleKey: z.literal('car_product_list_new'),
    startTime: z.number(),
});

export const NewProductListResponseSchema = DataResponseSchema(
    z.object({
        // Only the new product floors are kept, so the other home page floors cannot fail the response.
        floors: z.array(z.unknown()).transform((floors) => toSchemaItems(floors, NewProductFloorSchema)),
    })
);

// Detail

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
