import { afterEach, describe, expect, it, vi } from 'vitest';

import { compareDates, toISOString, toRFC822 } from './instant';
import { parseDate, parseDateStrict } from './parse-date';
import { parseRelativeDate } from './parse-relative-date';

const iso = (instant: Temporal.Instant | undefined) => instant && toISOString(instant);

describe('parseDate', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        ['2026-08-28T08:07:22', 8, '2026-08-28T00:07:22.000Z'],
        ['2026-09-07 00:00:00.000', 8, '2026-09-06T16:00:00.000Z'],
        ['2026-09-06T15:41:43', 0, '2026-09-06T15:41:43.000Z'],
        ['2026-09-18', 0, '2026-09-18T00:00:00.000Z'],
        ['2026-09-07T00:00:00', -3.5, '2026-09-07T03:30:00.000Z'],
        ['2026-09-07T08:00:00+08:00', 8, '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T08:00:00+0800', 0, '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T08:00:00-05:00', 8, '2026-09-07T13:00:00.000Z'],
        ['2026-09-07 08:00:00 +08:00', 0, '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T00:00:00Z', 8, '2026-09-07T00:00:00.000Z'],
        ['Mon, 07 Sep 2026 08:00:00 GMT+8', 8, '2026-09-07T00:00:00.000Z'],
        ['Mon, 07 Sep 2026 08:00:00 GMT', 8, '2026-09-07T08:00:00.000Z'],
        ['Mon, 07 Sep 2026 08:00:00 +0800', 0, '2026-09-07T00:00:00.000Z'],
        ['Mon, 07 Sep 2026 08:00:00 EDT', 0, '2026-09-07T12:00:00.000Z'],
        ['7 September 2026 08:00', 8, '2026-09-07T00:00:00.000Z'],
        ['2026/9/7 8:05', 8, '2026-09-07T00:05:00.000Z'],
        ['20260907', 0, '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T08:00:00.5', 0, '2026-09-07T08:00:00.500Z'],
    ])('parses %s in offset %s with no format', (input, offset, expected) => {
        expect(iso(parseDate(input, offset))).toBe(expected);
    });

    it('uses UTC by default, independently of the host time zone', () => {
        vi.stubEnv('TZ', 'Asia/Tokyo');
        expect(iso(parseDate('2026-09-07 08:00:00'))).toBe('2026-09-07T08:00:00.000Z');
        expect(iso(parseDate('2026-09-07 08:00', 'YYYY-MM-DD HH:mm'))).toBe('2026-09-07T08:00:00.000Z');
        vi.unstubAllEnvs();
    });

    it('accepts an IANA time zone and follows its DST', () => {
        expect(iso(parseDate('2026-01-07 08:00', undefined, 'America/New_York'))).toBe('2026-01-07T13:00:00.000Z');
        expect(iso(parseDate('2026-07-07 08:00', 'YYYY-MM-DD HH:mm', 'America/New_York'))).toBe('2026-07-07T12:00:00.000Z');
    });

    it('throws on an unknown time zone', () => {
        expect(() => parseDate('2026-09-07', undefined, 'Mars/Phobos')).toThrow(RangeError);
    });

    it('reads a number as a timestamp in milliseconds', () => {
        expect(iso(parseDate(1_788_739_200_000))).toBe('2026-09-07T00:00:00.000Z');
        expect(iso(parseDate(1_788_739_200_000, 8))).toBe('2026-09-07T00:00:00.000Z');
        expect(parseDate(NaN)).toBeUndefined();
    });

    it.each([
        ['1788739200', 'X', '2026-09-07T00:00:00.000Z'],
        [1_788_739_200, 'X', '2026-09-07T00:00:00.000Z'],
        ['1788739200000', 'x', '2026-09-07T00:00:00.000Z'],
        ['07/09/2026', 'DD/MM/YYYY', '2026-09-07T00:00:00.000Z'],
        ['2026年9月7日 08:05', 'YYYY年M月D日 HH:mm', '2026-09-07T08:05:00.000Z'],
        ['September 7, 2026', 'MMMM D, YYYY', '2026-09-07T00:00:00.000Z'],
        ['Sep 7th 2026 8:05 PM', 'MMM Do YYYY h:mm A', '2026-09-07T20:05:00.000Z'],
        ['Sep 7 2026 12:05 am', 'MMM D YYYY h:mm a', '2026-09-07T00:05:00.000Z'],
        ['07.09.26', 'DD.MM.YY', '2026-09-07T00:00:00.000Z'],
        ['2026-09-07 08:00 +0800', 'YYYY-MM-DD HH:mm ZZ', '2026-09-07T00:00:00.000Z'],
        ['2026-09-07T08:00:00.123', 'YYYY-MM-DDTHH:mm:ss.SSS', '2026-09-07T08:00:00.123Z'],
        ['20260907080500', 'YYYYMMDDHHmmss', '2026-09-07T08:05:00.000Z'],
        // the lenient mode ignores the text around the tokens and does not compare separators
        ['发布时间：2026-09-07 来源', 'YYYY-MM-DD', '2026-09-07T00:00:00.000Z'],
        ['2026/09/07', 'YYYY-MM-DD', '2026-09-07T00:00:00.000Z'],
        ['2026-09-07 [draft]', 'YYYY-MM-DD [draft]', '2026-09-07T00:00:00.000Z'],
    ])('parses %s with format %s', (input, format, expected) => {
        expect(iso(parseDate(input, format))).toBe(expected);
    });

    it('applies the time zone to a format with no offset token', () => {
        expect(iso(parseDate('2026-09-07 08:00', 'YYYY-MM-DD HH:mm', 8))).toBe('2026-09-07T00:00:00.000Z');
        expect(iso(parseDate('2026-09-07 08:00 +0100', 'YYYY-MM-DD HH:mm ZZ', 8))).toBe('2026-09-07T07:00:00.000Z');
    });

    it('reads a numeric offset as plain hours, also outside the offsets of real zones', () => {
        expect(iso(parseDate('2026-09-07 00:00', 'YYYY-MM-DD HH:mm', -33))).toBe('2026-09-08T09:00:00.000Z');
        expect(iso(parseDate('2026-09-07 00:00', 30))).toBe('2026-09-05T18:00:00.000Z');
        expect(iso(parseDate('2026-09-07 00:00', 5.75))).toBe('2026-09-06T18:15:00.000Z');
    });

    it('takes the first format that parses', () => {
        const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'MMM D, YYYY'];
        expect(iso(parseDate('2026-09-07 08:05:09', formats))).toBe('2026-09-07T08:05:09.000Z');
        expect(iso(parseDate('2026-09-07 08:05', formats))).toBe('2026-09-07T08:05:00.000Z');
        expect(iso(parseDate('Sep 7, 2026', formats))).toBe('2026-09-07T00:00:00.000Z');
    });

    it('fills missing date fields from the current date in the time zone', () => {
        // 2026-12-31T20:00Z is 2027-01-01 04:00 in UTC+8
        vi.spyOn(Temporal.Now, 'instant').mockReturnValue(Temporal.Instant.from('2026-12-31T20:00:00Z'));
        expect(iso(parseDate('09-07 08:00', 'MM-DD HH:mm'))).toBe('2026-09-07T08:00:00.000Z');
        expect(iso(parseDate('09-07 08:00', 'MM-DD HH:mm', 8))).toBe('2027-09-07T00:00:00.000Z');
        expect(iso(parseDate('08:00', 'HH:mm', 8))).toBe('2027-01-01T00:00:00.000Z');
        expect(iso(parseDate('2026', 'YYYY'))).toBe('2026-01-01T00:00:00.000Z');
    });

    it.each([
        ['', undefined],
        ['unknown', undefined],
        ['March 7, 2026', undefined],
        ['2026-13-45', undefined],
        // a time needs a full date before it: this is not year, month and hour
        ['2026-09  12', undefined],
        ['2026 12:30', undefined],
        ['2026-13-45', 'YYYY-MM-DD'],
        ['2026-02-30', 'YYYY-MM-DD'],
        ['7 Sept 2026', 'D MMM YYYY'],
        ['no digits', 'YYYY-MM-DD'],
        ['', 'X'],
        ['abc', 'X'],
    ])('returns undefined for %j with format %s', (input, format) => {
        expect(parseDate(input, format)).toBeUndefined();
    });
});

describe('input type', () => {
    it.each(['', undefined, null, 0])('returns undefined for the empty input %j', (input) => {
        const value = input as unknown as string;
        expect(parseDate(value)).toBeUndefined();
        expect(parseDate(value, 8)).toBeUndefined();
        expect(parseDate(value, 'YYYY-MM-DD')).toBeUndefined();
        expect(parseDate(value, 'X')).toBeUndefined();
        expect(parseDateStrict(value, 'YYYY-MM-DD')).toBeUndefined();
        expect(parseRelativeDate(value)).toBeUndefined();
    });

    it.each([{}, true, ['2026-09-07'], Temporal.Instant.from('2026-09-07T00:00:00Z')])('throws a TypeError for %s', (input) => {
        const value = input as unknown as string;
        expect(() => parseDate(value)).toThrow(TypeError);
        expect(() => parseDate(value, 'YYYY-MM-DD', 8)).toThrow(TypeError);
        expect(() => parseRelativeDate(value)).toThrow(TypeError);
    });

    it('does not spend quadratic time on long input', () => {
        const started = performance.now();
        expect(parseDate('1'.repeat(100000), 'MMM D, YYYY')).toBeUndefined();
        expect(parseDate(`5 Mar 2024${' '.repeat(100000)}x`)).toBeUndefined();
        expect(performance.now() - started).toBeLessThan(500);
    });
});

describe('parseDateStrict', () => {
    it.each([
        ['2026-09-07', 'YYYY-MM-DD', '2026-09-07T00:00:00.000Z'],
        ['2026-9-7', 'YYYY-M-D', '2026-09-07T00:00:00.000Z'],
        ['2026年09月07日 08:05', 'YYYY年MM月DD日 HH:mm', '2026-09-07T08:05:00.000Z'],
        ['发布日期：2026-09-07', '发布日期：YYYY-MM-DD', '2026-09-07T00:00:00.000Z'],
        ['7 September 2026', 'D MMMM YYYY', '2026-09-07T00:00:00.000Z'],
        ['Mon, Sep 7th 2026 8:05 PM', 'ddd, MMM Do YYYY h:mm A', '2026-09-07T20:05:00.000Z'],
        ['2026-09-07T08:00:00+08:00', 'YYYY-MM-DDTHH:mm:ssZ', '2026-09-07T00:00:00.000Z'],
        ['2026-09-07 at 08:00', 'YYYY-MM-DD [at] HH:mm', '2026-09-07T08:00:00.000Z'],
        ['1788739200', 'X', '2026-09-07T00:00:00.000Z'],
    ])('parses %s with format %s', (input, format, expected) => {
        expect(iso(parseDateStrict(input, format))).toBe(expected);
    });

    it.each([
        ['2026-09-07 08:05', 'YYYY-MM-DD'],
        ['发布时间：2026-09-07', 'YYYY-MM-DD'],
        ['2026/09/07', 'YYYY-MM-DD'],
        ['2026-9-7', 'YYYY-MM-DD'],
        ['2026-09-07', 'YYYY-M-D'],
        ['2026-02-30', 'YYYY-MM-DD'],
        ['2026-13-01', 'YYYY-MM-DD'],
        ['7 september 2026', 'D MMMM YYYY'],
        ['2026-09-07 24:00', 'YYYY-MM-DD HH:mm'],
    ])('returns undefined for %s with format %s', (input, format) => {
        expect(parseDateStrict(input, format)).toBeUndefined();
    });

    it('takes the first format that matches and applies the time zone', () => {
        const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'];
        expect(iso(parseDateStrict('2026-09-07', formats, 8))).toBe('2026-09-06T16:00:00.000Z');
        expect(iso(parseDateStrict('2026-09-07 08:00:00', formats, 'Asia/Shanghai'))).toBe('2026-09-07T00:00:00.000Z');
        expect(parseDateStrict('2026-09-07 08:00', formats)).toBeUndefined();
    });
});

describe('toRFC822', () => {
    it('formats an instant in GMT', () => {
        expect(toRFC822(Temporal.Instant.from('2026-09-06T16:05:09Z'))).toBe('Sun, 06 Sep 2026 16:05:09 GMT');
    });
});

describe('compareDates', () => {
    it('sorts instants, timestamps and date strings, with missing and unparseable dates as the epoch', () => {
        const newest = Temporal.Instant.from('2026-09-08T00:00:00Z');
        const dates = ['2026-09-07T00:00:00Z', null, newest, 'unknown', 1_788_739_200_001];
        expect(dates.toSorted((a, b) => compareDates(b, a))).toEqual([newest, 1_788_739_200_001, '2026-09-07T00:00:00Z', null, 'unknown']);
        expect(compareDates(undefined, 0)).toBe(0);
        expect(compareDates('2026-09-07T08:00:00+08:00', 1_788_739_200_000)).toBe(0);
    });
});
