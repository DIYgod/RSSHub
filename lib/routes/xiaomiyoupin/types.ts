import { z } from 'zod';

// Response schemas mirror the upstream JSON shape, which nests deeper than the lint limit allows.
// oxlint-disable unicorn/max-nested-calls

const DataResponseSchema = <Schema extends z.ZodType>(data: Schema) => z.object({ data });

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

// Floors reuse `data.items` for every module, so entries are validated one by one and the ones
// without a title are dropped. The key is an array or missing depending on the module.
const toHomepageFloorEntries = (items: unknown[] = []) => toSchemaItems(items, HomepageFloorEntrySchema);

export const HomepageMainResponseSchema = DataResponseSchema(
    z.object({
        homepage: z.object({
            floors: z.array(
                z.object({
                    data: z
                        .object({
                            items: z.array(z.unknown()).optional(),
                        })
                        .transform((data) => ({
                            items: toHomepageFloorEntries(data.items),
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

export const VenueGoodsBatchItemSchema = z.object({
    type: z.string(),
    value: z.object({
        goods: z.object({
            // Some venue results omit the release time, the list falls back to the item identity only.
            fist_release_time: z.number().optional(),
            gid: z.number(),
            img_square: z.string(),
            name: z.string(),
        }),
    }),
});

// Venue results also carry content cards and banners, only `goods` members hold a renderable goods.
export const VenueGoodsTypeBatchItemSchema = VenueGoodsBatchItemSchema.extend({
    type: z.literal('goods'),
});

export type VenueGoodsTypeBatchItem = z.infer<typeof VenueGoodsTypeBatchItemSchema>;

export const VenueBatchResponseSchema = <Result extends z.ZodType>(result: Result) =>
    DataResponseSchema(
        z.object({
            result_list: z.array(result),
        })
    );

// Crowdfunding

export const VenueReservationBatchItemSchema = z.object({
    gid: z.number(),
    goodsInfo: z.object({
        img_square: z.string(),
        name: z.string(),
    }),
});

export type VenueReservationBatchItem = z.infer<typeof VenueReservationBatchItemSchema>;

// Content cards share the flat result shape but expose no goods identity, so the route skips them.
const VenueContentBatchItemSchema = z.object({
    goodsType: z.number(),
    id: z.string(),
});

// Goods results are batched in a `list`, reservation and content results stay flat.
const CrowdfundingGoodsBatchSchema = z.object({
    list: z.array(VenueGoodsBatchItemSchema),
});

// Only members carrying a `goods` object are renderable, content cards are dropped.
const CrowdfundingBatchListItemSchema = z.union([VenueGoodsTypeBatchItemSchema, VenueReservationBatchItemSchema]);

export type CrowdfundingBatchListItem = z.infer<typeof CrowdfundingBatchListItemSchema>;

const toCrowdfundingEntries = (result: unknown): CrowdfundingBatchListItem[] => {
    const goodsBatch = CrowdfundingGoodsBatchSchema.safeParse(result);
    if (goodsBatch.success) {
        return toSchemaItems(goodsBatch.data.list, VenueGoodsTypeBatchItemSchema);
    }
    return toSchemaItems([result], VenueReservationBatchItemSchema);
};

export const CrowdfundingBatchResultSchema = z.union([CrowdfundingGoodsBatchSchema, VenueReservationBatchItemSchema, VenueContentBatchItemSchema]).transform(toCrowdfundingEntries);

// NewProduct

// Banner members carry no `type` and no nested goods, they only describe a new product picture.
export const VenueBannerBatchItemSchema = z.object({
    gid: z.number(),
    new_product_name: z.string(),
    picture_url: z.string(),
});

export type VenueBannerBatchItem = z.infer<typeof VenueBannerBatchItemSchema>;

// Response members are validated loosely, so an unexpected member never breaks the whole batch.
const NewProductBatchMemberSchema = z.union([VenueGoodsBatchItemSchema, VenueBannerBatchItemSchema]);

// The rendered list only keeps `goods` members and banners.
export const NewProductBatchListItemSchema = z.union([VenueGoodsTypeBatchItemSchema, VenueBannerBatchItemSchema]);

export type NewProductBatchListItem = z.infer<typeof NewProductBatchListItemSchema>;

const toNewProductEntries = (items: unknown[]) => toSchemaItems(items, NewProductBatchListItemSchema);

export const NewProductBatchResultSchema = z.object({
    list: z.array(NewProductBatchMemberSchema).transform(toNewProductEntries),
});

// GoodsDetail

// Upstream reports missing sections and variant prices as `null` instead of omitting the key.
const GoodsDetailItemSchema = z.object({
    goodsInfo: z.object({
        firstSellPoint: z.string(),
        imgHorizon: z.string(),
        pids: z.array(z.number()),
        secondSellPoint: z.string(),
        thirdSellPoint: z.string(),
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

// Crowdfunding

const CrowdfundingSectionSchema = z.object({
    endTime: z.number(),
    estimateSendtime: z.number(),
    startTime: z.number(),
});

const CrowdfundingDetailItemSchema = GoodsDetailItemSchema.extend({
    crowdFunding: CrowdfundingSectionSchema,
});

export type CrowdfundingDetailItem = z.infer<typeof CrowdfundingDetailItemSchema>;

export const CrowdfundingDetailResponseSchema = DataResponseSchema(
    z.object({
        goods: CrowdfundingDetailItemSchema,
    })
);

// NewProduct

// New products may still be sold outside a crowdfunding round, so the section may be `null`.
const NewProductDetailItemSchema = GoodsDetailItemSchema.extend({
    crowdFunding: CrowdfundingSectionSchema.nullable(),
});

export type NewProductDetailItem = z.infer<typeof NewProductDetailItemSchema>;

export const NewProductDetailResponseSchema = DataResponseSchema(
    z.object({
        goods: NewProductDetailItemSchema,
    })
);
