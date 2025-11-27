import { describe, expect, it } from 'vitest';

import { getRouteNameFromPath, getSearchParamsString, parseDuration } from '@/utils/helpers';

describe('helpers', () => {
    it('getRouteNameFromPath', () => {
        expect(getRouteNameFromPath('/test/1')).toBe('test');
    });

    it('getSearchParamsString', () => {
        expect(getSearchParamsString({ a: 1, b: 2 })).toBe('a=1&b=2');
        expect(getSearchParamsString({ a: 1, b: undefined })).toBe('a=1');
        expect(getSearchParamsString({ a: undefined })).toBe('');
        expect(getSearchParamsString({})).toBe('');

        const searchParams = new URLSearchParams();
        searchParams.append('ids[]', '1');
        searchParams.append('ids[]', '2');
        expect(getSearchParamsString(searchParams)).toBe('ids%5B%5D=1&ids%5B%5D=2');
    });

    it('parseDuration', () => {
        expect(parseDuration('01:01:01')).toBe(3661);
        expect(parseDuration('01:01')).toBe(61);
        expect(parseDuration('00:01')).toBe(1);
        expect(parseDuration('59')).toBe(59);
    });
});
