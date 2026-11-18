import { describe, expect, it } from 'vitest';

import { collapseWhitespace, convertDateToISO8601, getLocalhostAddress, getSubPath, toTitleCase } from '@/utils/common-utils';

describe('common-utils', () => {
    it('toTitleCase', () => {
        expect(toTitleCase('RSSHub IS AS aweSOme aS henry')).toBe('Rsshub Is as Awesome as Henry');
    });

    it('convertDateToISO8601', () => {
        expect(convertDateToISO8601('')).toBe('');
        expect(convertDateToISO8601(null)).toBe(null);
        expect(convertDateToISO8601(undefined)).toBe(undefined);

        const expected = '2019-01-01T00:00:00.000Z';
        expect(convertDateToISO8601(Temporal.Instant.from(expected))).toBe(expected);
        expect(convertDateToISO8601(1_546_300_800_000)).toBe(expected);
        expect(convertDateToISO8601(expected)).toBe(expected);
        expect(convertDateToISO8601('Tue, 01 Jan 2019 00:00:00 GMT')).toBe(expected);
        expect(convertDateToISO8601('Tue, 01 Jan 2019 08:00:00 UTC+8')).toBe(expected);

        // no zone in the string, so it is read as UTC
        expect(convertDateToISO8601('Tue, 01 Jan 2019 00:00:00')).toBe(expected);
        expect(convertDateToISO8601('something invalid')).toBeUndefined();
    });

    it('collapseWhitespace', () => {
        expect(collapseWhitespace('')).toBe('');
        expect(collapseWhitespace(null)).toBe(null);
        expect(collapseWhitespace(undefined)).toBe(undefined);
        expect(collapseWhitespace('   \n\n\n    ')).toBe('');
        expect(collapseWhitespace('a string already collapsed')).toBe('a string already collapsed');
        expect(collapseWhitespace(' \n  a lot of     whitespaces   and \n\n\n\n linebreaks   \n\n ')).toBe('a lot of whitespaces and linebreaks');
    });

    it('getLocalhostAddress', () => {
        expect(getLocalhostAddress()).toBeInstanceOf(Array);
    });

    it('getSubPath', () => {
        expect(getSubPath({ req: { path: '/test/abc' } })).toBe('/abc');
        expect(getSubPath({ req: { path: '/test' } })).toBe('/');
    });
});
