import { expect, it } from 'vitest';

import { parseDuration } from './duration';

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
