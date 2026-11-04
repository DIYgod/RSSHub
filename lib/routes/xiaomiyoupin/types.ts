import { z } from 'zod';

// Response schemas mirror the upstream JSON shape, which nests deeper than the lint limit allows.
// oxlint-disable unicorn/max-nested-calls

const DataResponseSchema = <Schema extends z.ZodType>(data: Schema) => z.object({ data });

const ListResultSchema = <Schema extends z.ZodType>(result: Schema) => z.object({ list: z.array(result) });

// Entries are validated one by one, so an unexpected entry never breaks the whole list.
const toSchemaItems = <Schema extends z.ZodType>(items: unknown[], schema: Schema): Array<z.infer<Schema>> =>
    items.flatMap((item) => {
        const result = schema.safeParse(item);
        return result.success ? [result.data] : [];
    });

// Homepage

const HomepageFloorEntrySchema = z.object({
    item: z.object({
        jump_url: z.string(),
        title: z.string(),
    }),
});

export const HomepageResponseSchema = DataResponseSchema(
    z.object({
        homepage: z.object({
            floors: z.array(
                z.object({
                    data: z
                        .object({
                            items: z.array(z.unknown()).optional(),
                        })
                        .transform((data) => ({
                            items: toSchemaItems(data.items ?? [], HomepageFloorEntrySchema),
                        })),
                    module_key: z.string(),
                })
            ),
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
                query_list: z.array(VenueQuerySchema),
            })
        ),
    })
);

// VenueBatch

const BaseListItemSchema = z.object({
    type: z.string(),
    value: z.object({
        goods: z.object({
            fist_release_time: z.number().optional(),
            gid: z.number(),
            img_square: z.string(),
            name: z.string(),
        }),
    }),
});

export const CommonListItemSchema = BaseListItemSchema.extend({
    type: z.literal('goods'),
});

export type CommonListItem = z.infer<typeof CommonListItemSchema>;

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

export const CrowdfundingListSchema = z
    .union([
        // crowd-funding
        ListResultSchema(BaseListItemSchema),
        // reservation with goodsInfo
        VenueReservationListItemSchema,
        // reservation without goodsInfo, skipped
        z.object({ goodsType: z.number(), id: z.string() }),
    ])
    .transform((result) => {
        const goodsBatch = ListResultSchema(BaseListItemSchema).safeParse(result);
        return goodsBatch.success ? toSchemaItems(goodsBatch.data.list, CommonListItemSchema) : toSchemaItems([result], VenueReservationListItemSchema);
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

export const NewProductListSchema = ListResultSchema(
    z.union([
        // leek-super
        VenueBannerListItemSchema,
        // leek-selective
        BaseListItemSchema,
    ])
).transform((result) => toSchemaItems(result.list, NewProductListItemSchema));

// GoodsDetail

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
                .nullable(),
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
                .nullable(),
            price: z.number(),
            singlePrice: z
                .array(
                    z.object({
                        price: z.number(),
                    })
                )
                .nullable(),
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
            .nullable(),
    }),
});

export type CrowdfundingDetailItem = z.infer<typeof CrowdfundingDetailItemSchema>;

// NewProduct

export const NewProductDetailItemSchema = BaseDetailItemSchema;

export type NewProductDetailItem = z.infer<typeof NewProductDetailItemSchema>;
