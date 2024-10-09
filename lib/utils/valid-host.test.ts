import { describe, expect, it } from 'vitest';
import { isValidHost } from '@/utils/valid-host';

describe('valid-host', () => {
    it('validate hostname', () => {
        expect(isValidHost()).toBe(false);
        expect(isValidHost('')).toBe(false);
        expect(isValidHost('subd0main')).toBe(true);
        expect(isValidHost('-subd0main')).toBe(false);
        expect(isValidHost('sub-d0main')).toBe(true);
        expect(isValidHost('subd0main-')).toBe(false);
        expect(isValidHost('sub.d0main')).toBe(false);
        expect(isValidHost('sub-.d0main')).toBe(false);
        expect(isValidHost('s')).toBe(true);
        expect(isValidHost('-')).toBe(false);
        expect(isValidHost('0')).toBe(true);
        expect(isValidHost('s-')).toBe(false);
        expect(isValidHost('s-u')).toBe(true);
        expect(isValidHost('su')).toBe(true);
    });
});
