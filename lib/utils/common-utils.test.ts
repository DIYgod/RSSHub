import { describe, expect, it } from 'vitest';

import { collapseWhitespace, getLocalhostAddress, getSubPath, toTitleCase } from '@/utils/common-utils';

describe('common-utils', () => {
    it('toTitleCase', () => {
        expect(toTitleCase('RSSHub IS AS aweSOme aS henry')).toBe('Rsshub Is as Awesome as Henry');
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
