import { describe, expect, it } from 'vitest';

import { parseDateInTimezone } from './parse-date-in-timezone';

describe('parseDateInTimezone', () => {
    it.each([
        ['2026-08-28T08:07:22', 8, '2026-08-28T00:07:22.000Z'],
        ['2026-09-07 00:00:00.000', 8, '2026-09-06T16:00:00.000Z'],
        ['2026-09-06T15:41:43', 0, '2026-09-06T15:41:43.000Z'],
        ['2026-09-18', 0, '2026-09-18T00:00:00.000Z'],
        ['2026-09-07T00:00:00', -3.5, '2026-09-07T03:30:00.000Z'],
        ['2026-09-07T08:00:00+08:00', 8, '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T08:00:00+0800', 0, '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T08:00:00-05:00', 8, '2026-09-07T13:00:00.000Z'],
        ['2026-09-07T00:00:00Z', 8, '2026-09-07T00:00:00.000Z'],
        ['Mon, 07 Sep 2026 08:00:00 GMT+8', 8, '2026-09-07T00:00:00.000Z'],
    ])('parses %s in offset %s independently of the host timezone', (input, offset, expected) => {
        expect(parseDateInTimezone(input, offset).toISOString()).toBe(expected);
    });

    it('preserves absolute Date and millisecond timestamp inputs without mutating them', () => {
        const date = new Date('2026-09-07T00:00:00Z');
        expect(parseDateInTimezone(date, 8).getTime()).toBe(date.getTime());
        expect(parseDateInTimezone(date.getTime(), -5).getTime()).toBe(date.getTime());
        expect(date.toISOString()).toBe('2026-09-07T00:00:00.000Z');
    });

    it('does not invent a date for an empty or unparseable string', () => {
        expect(Number.isNaN(parseDateInTimezone('', 8).getTime())).toBe(true);
        expect(Number.isNaN(parseDateInTimezone('unknown', 8).getTime())).toBe(true);
    });
});
