import { describe, expect, it } from 'vitest';
import { getRouteNameFromPath, getSearchParamsString } from '@/utils/helpers';

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
});
