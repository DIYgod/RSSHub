export interface SearchResponse {
    meta: {
        nextPageToken: string;
        previousPageToken: string;
        numFound: string;
    };
    items: [
        {
            id: string;
            sellerId: string;
            buyerId: string;
            status: string;
            name: string;
            price: string;
            created: string;
            updated: string;
            thumbnails: string[];
            itemType: string;
            itemConditionId: string;
            shippingPayerId: string;
            itemSizes: any[];
            itemBrand: any;
            itemPromotions: any[];
            shopName: string;
            itemSize: any;
            shippingMethodId: string;
            categoryId: string;
            isNoPrice: boolean;
            title: string;
            isLiked: boolean;
            photos: [
                {
                    uri: string;
                },
            ];
            auction: any;
        },
    ];
    components: any[];
    searchCondition: any;
    searchConditionId: string;
}

export interface ItemDetail {
    result: string;
    data: {
        id: string;
        seller: {
            id: number;
            name: string;
            photo_url: string;
            photo_thumbnail_url: string;
            register_sms_confirmation: string;
            register_sms_confirmation_at: string;
            created: number;
            num_sell_items: number;
            ratings: {
                good: number;
                normal: number;
                bad: number;
            };
            num_ratings: number;
            score: number;
            is_official: boolean;
            quick_shipper: boolean;
            is_followable: boolean;
            is_blocked: boolean;
            star_rating_score: number;
        };
        status: string;
        name: string;
        price: number;
        description: string;
        photos: string[];
        photo_paths: string[];
        thumbnails: string[];
        item_category: {
            id: number;
            name: string;
            display_order: number;
            parent_category_id: number;
            parent_category_name: string;
            root_category_id: number;
            root_category_name: string;
        };
        item_category_ntiers: {
            id: number;
            name: string;
            display_order: number;
            parent_category_id: number;
            parent_category_name: string;
            root_category_id: number;
            root_category_name: string;
            brand_group_id: number;
        };
        parent_categories_ntiers: Array<{
            id: number;
            name: string;
            display_order: number;
        }>;
        item_condition: {
            id: number;
            name: string;
            subname: string;
        };
        colors: any[];
        shipping_payer: {
            id: number;
            name: string;
            code: string;
        };
        shipping_method: {
            id: number;
            name: string;
            is_deprecated: string;
        };
        shipping_from_area: {
            id: number;
            name: string;
        };
        shipping_duration: {
            id: number;
            name: string;
            min_days: number;
            max_days: number;
        };
        shipping_class: {
            id: number;
            fee: number;
            icon_id: number;
            pickup_fee: number;
            shipping_fee: number;
            total_fee: number;
            is_pickup: boolean;
        };
        num_likes: number;
        num_comments: number;
        registered_prices_count: number;
        comments: any[];
        updated: number;
        created: number;
        pager_id: number;
        liked: boolean;
        checksum: string;
        is_dynamic_shipping_fee: boolean;
        application_attributes: any;
        is_shop_item: string;
        hash_tags: any[];
        is_anonymous_shipping: boolean;
        is_web_visible: boolean;
        is_offerable: boolean;
        is_organizational_user: boolean;
        organizational_user_status: string;
        is_stock_item: boolean;
        is_cancelable: boolean;
        shipped_by_worker: boolean;
        additional_services: any[];
        has_additional_service: boolean;
        delivery_facility_type: string;
        has_like_list: boolean;
        is_offerable_v2: boolean;
        offer_coupon_display: {
            display_text: string;
            display_price: number;
            display_discount_label: string;
            include_coupon: boolean;
            expire_time: number;
            current_time: number;
            repeated: boolean;
            breakdown: {
                coupon_discount: number;
                offer_discount: number;
                total: number;
            };
            omakase: boolean;
        };
        item_attributes: Array<{
            id: string;
            text: string;
            values: Array<{
                id: string;
                text: string;
            }>;
            deep_facet_filterable: boolean;
            show_on_ui: boolean;
        }>;
        is_dismissed: boolean;
        photo_descriptions: string[];
        meta_title: string;
        meta_subtitle: string;
        price_promotion_area_details: {
            promotion_type: string;
            promotion_info: Array<{
                label_text: string;
                supplementary_text: string;
                expire_time: number;
                promotion_duration: number;
            }>;
        };
    };
    meta: object;
}

export interface ShopItemDetail {
    name: string;
    displayName: string;
    productTags: string[];
    thumbnail: string;
    price: string;
    createTime: string;
    updateTime: string;
    attributes: any[];
    productDetail: {
        shop: {
            name: string;
            displayName: string;
            thumbnail: string;
            shopStats: {
                shopId: string;
                score: number;
                reviewCount: string;
            };
            allowDirectMessage: boolean;
            shopItems: Array<{
                productId: string;
                displayName: string;
                productTags: string[];
                thumbnail: string;
                price: string;
            }>;
            isInboundXb: boolean;
        };
        photos: string[];
        description: string;
        categories: Array<{
            categoryId: string;
            displayName: string;
            parentId: string;
            rootId: string;
            hasChild: boolean;
        }>;
        brand: null;
        condition: {
            displayName: string;
        };
        shippingMethod: {
            shippingMethodId: string;
            displayName: string;
            isAnonymous: boolean;
        };
        shippingPayer: {
            shippingPayerId: string;
            displayName: string;
            code: string;
        };
        shippingDuration: {
            shippingDurationId: string;
            displayName: string;
            minDays: number;
            maxDays: number;
        };
        shippingFromArea: {
            shippingAreaCode: string;
            displayName: string;
        };
        promotions: any[];
        productStats: null;
        timeSaleDetails: null;
        variants: Array<{
            variantId: string;
            displayName: string;
            quantity: string;
            size: string;
        }>;
        shippingFeeConfig: null;
        variationGrouping: null;
    };
}
