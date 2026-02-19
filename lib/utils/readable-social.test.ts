import { describe, expect, test } from 'vitest';

import { fallback, queryToBoolean, queryToFloat, queryToInteger } from './readable-social';

describe('fallback', () => {
    test('应该返回第一个存在的参数', () => {
        expect(fallback('primary', 'secondary', 'default')).toBe('primary');
        expect(fallback(undefined, 42, 0)).toBe(42);
        expect(fallback(null, '', 'default')).toBe('');
    });

    test('应该返回默认值', () => {
        expect(fallback(undefined, null, 'default')).toBe('default');
        expect(fallback(null, undefined, 3.14)).toBe(3.14);
    });
});

describe('queryToBoolean', () => {
    test('should handle truthy values', () => {
        expect(queryToBoolean('1')).toBe(true);
        expect(queryToBoolean('true')).toBe(true);
    });

    test('should handle falsy values', () => {
        expect(queryToBoolean('0')).toBe(false);
        expect(queryToBoolean('false')).toBe(false);
    });

    test('should handle undefined and array inputs', () => {
        expect(queryToBoolean(undefined)).toBeUndefined();
        expect(queryToBoolean([])).toBeUndefined();
        expect(queryToBoolean(['false', 'true'])).toBe(false);
    });
});

describe('queryToInteger', () => {
    test('should parse valid integers', () => {
        expect(queryToInteger('42')).toBe(42);
        expect(queryToInteger('-3')).toBe(-3);
    });

    test('should handle invalid inputs', () => {
        expect(queryToInteger(null)).toBeNull();
        expect(queryToInteger('abc')).toBeNaN();
    });

    test('should handle array inputs', () => {
        expect(queryToInteger([])).toBeUndefined();
        expect(queryToInteger(['7'])).toBe(7);
    });
});

describe('queryToFloat', () => {
    test('should handle undefined', () => {
        expect(queryToFloat(undefined)).toBeUndefined();
    });

    test('should handle null', () => {
        expect(queryToFloat(null)).toBeNull();
    });

    test('should return undefined for invalid input', () => {
        expect(queryToFloat('invalid')).toBeNaN();
    });

    test('should process array input', () => {
        expect(queryToFloat(['3.14'])).toBe(3.14);
    });

    test('should handle empty array', () => {
        expect(queryToFloat([])).toBeUndefined();
    });

    test('should convert numeric string', () => {
        expect(queryToFloat('9.8')).toBe(9.8);
    });

    test('should handle edge cases', () => {
        expect(queryToFloat('3.1415926')).toBeCloseTo(3.141_592_6);
    });
});
