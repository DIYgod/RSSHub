import { describe, expect, test } from 'vitest';

import { pickLink } from './routes/tencent/finance/newslist';

describe('pickLink', () => {
    test('uses Tencent information detail page when API item has no URL', () => {
        expect(pickLink({ id: 'FN20260607222210a69aa76b' })).toBe('https://wzq.tenpay.com/mp/v1/information/detail.shtml?id=FN20260607222210a69aa76b');
    });

    test('upgrades API http URL to https', () => {
        expect(pickLink({ id: 'FN20260607222210a69aa76b', url: 'http://example.com/news/1' })).toBe('https://example.com/news/1');
    });

    test('normalizes protocol-relative API URL', () => {
        expect(pickLink({ id: 'FN20260607222210a69aa76b', url: '//example.com/news/1' })).toBe('https://example.com/news/1');
    });
});
