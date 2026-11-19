import { describe, expect, it } from 'vitest';

import { formatDate } from './format';
import { parseDate, parseDateStrict } from './parse-date';

// Wednesday 2026-09-02 07:05:09.004 UTC
const instant = Temporal.Instant.from('2026-09-02T07:05:09.004Z');

describe('formatDate', () => {
    it.each([
        ['YYYY-MM-DD HH:mm:ss', undefined, '2026-09-02 07:05:09'],
        ['YYYY-MM-DD HH:mm:ss.SSS', 8, '2026-09-02 15:05:09.004'],
        ['YYYYMMDD', 'Asia/Tokyo', '20260902'],
        ['YYYY年M月D日 HH:mm', 8, '2026年9月2日 15:05'],
        ['YY/M/D H:m:s', -9, '26/9/1 22:5:9'],
        ['dddd, MMMM Do YYYY h:mm A', undefined, 'Wednesday, September 2nd 2026 7:05 AM'],
        ['ddd, DD MMM YYYY hh:mm a', 12, 'Wed, 02 Sep 2026 07:05 pm'],
        ['d', undefined, '3'],
        ['YYYY-MM-DDTHH:mm:ssZ', 5.5, '2026-09-02T12:35:09+05:30'],
        ['HHmm ZZ', 'America/New_York', '0305 -0400'],
        ['X x', undefined, '1788332709 1788332709004'],
        ['h:mm A z', 'America/New_York', '3:05 AM EDT'],
        ['HH:mm z', 8, '15:05 GMT+8'],
        ['[Today is] YYYY [at] HH[h]', undefined, 'Today is 2026 at 07h'],
    ])('formats %s in zone %s', (format, zone, expected) => {
        expect(formatDate(instant, format, zone)).toBe(expected);
    });

    it('uses the zone of a zoned date-time', () => {
        expect(formatDate(instant.toZonedDateTimeISO('Asia/Shanghai'), 'YYYY-MM-DD HH:mm')).toBe('2026-09-02 15:05');
    });

    it.each([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 31])('writes the ordinal of day %i', (day) => {
        const expected = { 1: '1st', 2: '2nd', 3: '3rd', 21: '21st', 22: '22nd', 23: '23rd', 31: '31st' }[day] ?? `${day}th`;
        const date = Temporal.Instant.from(`2026-01-${String(day).padStart(2, '0')}T00:00:00Z`);
        expect(formatDate(date, 'Do')).toBe(expected);
    });

    it('writes what the parse functions read with the same format', () => {
        const strict = 'dddd, MMMM D, YYYY h:mm:ss A';
        const lenient = 'YYYY年M月D日 HH:mm:ss';
        const seconds = Temporal.Instant.from('2026-09-02T07:05:09Z');
        expect(parseDateStrict(formatDate(instant, strict, 8), strict, 8)).toEqual(seconds);
        expect(parseDate(formatDate(instant, lenient, 'Asia/Tokyo'), lenient, 'Asia/Tokyo')).toEqual(seconds);
    });
});
