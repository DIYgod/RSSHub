import { describe, expect, it } from 'vitest';

import { calendarToInstant } from '@/utils/time';

describe('calendarToInstant', () => {
    it.each([
        [{ calendar: 'roc', year: '115', month: '08', day: '31' }, 8, '2026-08-30T16:00:00Z'],
        [{ calendar: 'roc', year: 115, month: 8, day: 31 }, undefined, '2026-08-31T00:00:00Z'],
        [{ calendar: 'buddhist', year: '2569', month: '11', day: '19' }, 7, '2026-11-18T17:00:00Z'],
        [{ calendar: 'japanese', era: 'reiwa', year: '8', month: '8', day: '7', hour: '16', minute: '24' }, 9, '2026-08-07T07:24:00Z'],
        [{ calendar: 'japanese', era: 'reiwa', year: 1, month: 5, day: 1 }, 'Asia/Tokyo', '2019-04-30T15:00:00Z'],
        [{ calendar: 'japanese', era: 'heisei', year: 31, month: 4, day: 30 }, undefined, '2019-04-30T00:00:00Z'],
        [{ calendar: 'japanese', era: 'showa', year: 64, month: 1, day: 7 }, undefined, '1989-01-07T00:00:00Z'],
    ])('converts %j in zone %s', (date, timeZone, expected) => {
        expect(calendarToInstant(date, timeZone)?.toString()).toBe(expected);
    });

    it.each([
        { calendar: 'roc', year: 115, month: 2, day: 30 },
        { calendar: 'roc', year: 115, month: 13, day: 1 },
        { calendar: 'roc', year: '115年', month: 8, day: 31 },
        { calendar: 'roc', year: 115, month: undefined as never, day: 31 },
        { calendar: 'japanese', era: 'unknown', year: 8, month: 8, day: 7 },
        { calendar: 'no-such-calendar', year: 115, month: 8, day: 31 },
    ])('gives undefined for %j', (date) => {
        expect(calendarToInstant(date)).toBeUndefined();
    });
});
