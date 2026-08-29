type WallstreetcnContent = Record<string, unknown>;

const PAID_CONTENT_PATH = /\/(?:premium|member)\//;

/**
 * Uses Wallstreetcn's access metadata to keep paid and VIP content out of public feeds.
 * The list and detail APIs expose different subsets of these fields, so the predicate
 * intentionally accepts both shapes.
 */
export const isWallstreetcnPaidContent = (content: unknown): boolean => {
    if (!content || typeof content !== 'object') {
        return false;
    }

    const item = content as WallstreetcnContent;
    const uri = typeof item.uri === 'string' ? item.uri : '';
    const membershipUri = typeof item.membership_uri === 'string' ? item.membership_uri : '';

    return (
        PAID_CONTENT_PATH.test(uri) ||
        item.is_paid === true ||
        item.is_priced === true ||
        item.is_in_vip_privilege === true ||
        item.is_trial === true ||
        item.is_need_pay === true ||
        item.is_vip === true ||
        (item.product_id !== null && item.product_id !== undefined) ||
        membershipUri.length > 0
    );
};
