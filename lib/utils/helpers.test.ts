import { describe, expect, it } from 'vitest';

import { getCurrentPath, getRouteNameFromPath, getSearchParamsString, parseDuration } from '@/utils/helpers';

describe('helpers', () => {
    it('getRouteNameFromPath', () => {
        expect(getRouteNameFromPath('/test/1')).toBe('test');
        expect(getRouteNameFromPath('/')).toBeNull();
    });

    it('getCurrentPath', () => {
        const expected = import.meta.dirname;
        expect(getCurrentPath(import.meta.url)).toBe(expected);
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
        expect(parseDuration(null)).toBeUndefined();
        expect(parseDuration('1:xx')).toBe(60);
        const invalid: any = {
            trim: () => ({
                replaceAll: () => 'NaN:1',
            }),
        };
        expect(() => parseDuration(invalid)).toThrow('Invalid segment');
    });
});
