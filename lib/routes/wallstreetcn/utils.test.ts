import { describe, expect, test } from 'vitest';

import { isWallstreetcnPaidContent } from './utils';

describe('isWallstreetcnPaidContent', () => {
    test('filters premium URLs even when is_paid is false', () => {
        expect(
            isWallstreetcnPaidContent({
                uri: 'https://wallstreetcn.com/premium/articles/3780626',
                is_paid: false,
                is_priced: true,
            })
        ).toBe(true);
    });

    test('filters member articles from detail metadata', () => {
        expect(
            isWallstreetcnPaidContent({
                uri: 'https://wallstreetcn.com/member/articles/3780487',
                is_need_pay: true,
                membership_uri: 'https://wallstreetcn.com/membership?member_type=gold',
                vip_type: 'gold',
            })
        ).toBe(true);
    });

    test('keeps ordinary articles', () => {
        expect(
            isWallstreetcnPaidContent({
                uri: 'https://wallstreetcn.com/articles/3780625',
                is_paid: false,
                is_priced: false,
                is_trial: false,
                is_need_pay: false,
            })
        ).toBe(false);
    });

    test('does not classify malformed API values as paid', () => {
        expect(isWallstreetcnPaidContent(undefined)).toBe(false);
        expect(isWallstreetcnPaidContent({ uri: null, product_id: null, membership_uri: '' })).toBe(false);
    });
});
