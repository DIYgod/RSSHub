import { z } from 'zod';

import { toSchemaItems } from '@/routes/mi/types';

// Response schemas mirror the upstream JSON shape, which nests deeper than the lint limit allows.
// oxlint-disable unicorn/max-nested-calls

const DataResponseSchema = <Schema extends z.ZodType>(data: Schema) => z.object({ data });

// Homepage

const HomepageFloorEntrySchema = z.object({
    item: z.object({
        jump_url: z.string(),
        title: z.string(),
    }),
});

const HomepageFloorSchema = z.object({
    data: z
        .object({
            items: z.array(z.unknown()).optional(),
        })
        .transform((data) => ({
            items: toSchemaItems(data.items ?? [], HomepageFloorEntrySchema),
        })),
    module_key: z.string(),
});

export const HomepageResponseSchema = DataResponseSchema(
    z.object({
        homepage: z.object({
            // The route reads a single floor, so a floor of another shape must not fail the response.
            floors: z.array(z.unknown()).transform((floors) => toSchemaItems(floors, HomepageFloorSchema)),
        }),
    })
);

// VenuePage

const VenueQuerySchema = z.object({
    parameter: z.string(),
    resolver: z.string(),
    sign: z.string(),
});

export type VenueQuery = z.infer<typeof VenueQuerySchema>;

export const VenuePageResponseSchema = DataResponseSchema(
    z.object({
        floors: z.array(
            z.object({
                query_list: z.array(VenueQuerySchema).optional(),
            })
        ),
    })
);

// List

export const CommonListItemSchema = z.object({
    type: z.literal('goods'),
    value: z.object({
        goods: z.object({
            fist_release_time: z.number().optional(),
            gid: z.number(),
            img_square: z.string(),
            name: z.string(),
        }),
    }),
});

export type CommonListItem = z.infer<typeof CommonListItemSchema>;

// The list itself is checked loosely; its entries are parsed one by one.
const ListResultSchema = z.object({ list: z.array(z.unknown()) });

export const GenericListResponseSchema = <Result extends z.ZodType>(result: Result) =>
    DataResponseSchema(
        z.object({
            result_list: z.array(result),
        })
    );

// Crowdfunding

const VenueReservationListItemSchema = z.object({
    gid: z.number(),
    goodsInfo: z.object({
        img_square: z.string(),
        name: z.string(),
    }),
});

const CrowdfundingListItemSchema = z.union([
    // crowd-funding
    CommonListItemSchema,
    // reservation
    VenueReservationListItemSchema,
]);

export type CrowdfundingListItem = z.infer<typeof CrowdfundingListItemSchema>;

export const CrowdfundingListSchema = z.unknown().transform((result) => {
    // crowd-funding results hold a list of goods; reservation results are single entries, skipped when they have no goods
    const listResult = ListResultSchema.safeParse(result);
    return listResult.success ? toSchemaItems(listResult.data.list, CommonListItemSchema) : toSchemaItems([result], VenueReservationListItemSchema);
});

// NewProduct

const VenueBannerListItemSchema = z.object({
    gid: z.number(),
    new_product_name: z.string(),
    picture_url: z.string(),
});

const NewProductListItemSchema = z.union([
    // leek-super
    VenueBannerListItemSchema,
    // leek-selective
    CommonListItemSchema,
]);

export type NewProductListItem = z.infer<typeof NewProductListItemSchema>;

export const NewProductListSchema = ListResultSchema.transform((result) => toSchemaItems(result.list, NewProductListItemSchema));

// Detail

const BaseDetailItemSchema = z.object({
    goodsInfo: z.object({
        firstSellPoint: z.string(),
        imgHorizon: z.string(),
        pids: z.array(z.number()),
        secondSellPoint: z.string(),
        thirdSellPoint: z.string(),
    }),
    priceInfo: z.object({
        priceInfo: z.object({
            marketPrice: z.number(),
            onHandPrice: z
                .object({
                    price: z.number(),
                })
                .nullish(),
        }),
    }),
    productInfo: z.record(
        z.string(),
        z.object({
            attributeValues: z.array(z.string()),
            img: z.string(),
            marketPrice: z.number(),
            name: z.string(),
            onHandPrice: z
                .array(
                    z.object({
                        price: z.number(),
                    })
                )
                .nullish(),
            price: z.number(),
            singlePrice: z
                .array(
                    z.object({
                        price: z.number(),
                    })
                )
                .nullish(),
        })
    ),
});

export const GenericDetailResponseSchema = <Goods extends z.ZodType>(goods: Goods) => DataResponseSchema(z.object({ goods }));

// Crowdfunding

export const CrowdfundingDetailItemSchema = BaseDetailItemSchema.extend({
    crowdFunding: z.object({
        endTime: z.number(),
        estimateSendtime: z.number(),
        startTime: z.number(),
    }),
    oneYuanSupport: z.object({
        groupBuyInfo: z
            .object({
                good: z.object({
                    groupbuy_price: z.number(),
                    groupbuy_summary: z.string(),
                    img: z.string(),
                }),
            })
            .nullish(),
    }),
});

export type CrowdfundingDetailItem = z.infer<typeof CrowdfundingDetailItemSchema>;

// NewProduct

export const NewProductDetailItemSchema = BaseDetailItemSchema;

export type NewProductDetailItem = z.infer<typeof NewProductDetailItemSchema>;
