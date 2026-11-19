import { describe, expect, it } from 'vitest';

import { getCurrentPath, getRouteNameFromPath, getSearchParamsString, time } from '@/utils/helpers';

describe('helpers', () => {
    it('getRouteNameFromPath', () => {
        expect(getRouteNameFromPath('/test/1')).toBe('test');
        expect(getRouteNameFromPath('/')).toBeNull();
    });

    it('getCurrentPath', () => {
        const expected = import.meta.dirname;
        expect(getCurrentPath(import.meta.url)).toBe(expected);
    });

    it('time', () => {
        expect(time(performance.now() - 8.4061)).toMatch(/^\d+ms$/);
        expect(time(performance.now() - 2400)).toBe('2s');
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
