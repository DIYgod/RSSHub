import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseRelativeDate } from './parse-relative-date';

const p = (date: string, format?: string | string[], timeZone?: number | string) => parseRelativeDate(date, format, timeZone)?.epochMilliseconds;
const ms = (iso: string) => Temporal.Instant.from(`${iso}Z`).epochMilliseconds;

describe('parseRelativeDate', () => {
    // === CONSTANTS ===
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    // === BASE DATE SETUP: 2026-02-02 (Monday) ===
    const BASE_STR = '2026-02-02T12:00:00';
    const NOW_TIMESTAMP = ms(BASE_STR);

    // Derived Timestamps
    const TODAY_START = ms('2026-02-02T00:00:00');
    const YESTERDAY_START = TODAY_START - day;
    const TOMORROW_START = TODAY_START + day;

    // Strict Past Logic Expectations (Reference is Mon Feb 02)
    const PREVIOUS_MONDAY = TODAY_START - week; // Jan 26 (Last week)
    const PREVIOUS_WEDNESDAY = TODAY_START + 2 * day - week; // Jan 28 (Last week)
    const LAST_SUNDAY = ms('2026-02-01T00:00:00'); // Yesterday (Feb 01)
    const LAST_FRIDAY = ms('2026-01-30T00:00:00'); // Last Friday (Jan 30)

    beforeEach(() => {
        vi.spyOn(Temporal.Now, 'instant').mockReturnValue(Temporal.Instant.fromEpochMilliseconds(NOW_TIMESTAMP));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Category 1: Immediate & Fuzzy Semantics
     */
    describe('Immediate & Fuzzy Semantics', () => {
        it('handles "Just now" / "刚刚"', () => {
            const expected = NOW_TIMESTAMP - 3 * second;
            expect(p('Just now')).toBe(expected);
            expect(p('just now')).toBe(expected);
            expect(p('刚刚')).toBe(expected);
        });

        it('handles vague quantifiers (x / 几)', () => {
            // "几" maps to 3
            expect(p('几分钟前')).toBe(NOW_TIMESTAMP - 3 * minute);
            expect(p('幾分鐘前')).toBe(NOW_TIMESTAMP - 3 * minute);
            expect(p('数秒前')).toBe(NOW_TIMESTAMP - 3 * second);

            // "x" maps to 3
            expect(p('x days ago')).toBe(NOW_TIMESTAMP - 3 * day);
            expect(p('X seconds ago')).toBe(NOW_TIMESTAMP - 3 * second);

            // "a/an" maps to 1
            expect(p('a minute ago')).toBe(NOW_TIMESTAMP - 1 * minute);
        });
    });

    /**
     * Category 2: Relative Duration (Ago / In)
     */
    describe('Relative Duration', () => {
        it('handles past (ago / 前)', () => {
            expect(p('10m ago')).toBe(NOW_TIMESTAMP - 10 * minute);
            expect(p('2 hours ago')).toBe(NOW_TIMESTAMP - 2 * hour);
            expect(p('10秒前')).toBe(NOW_TIMESTAMP - 10 * second);
        });

        it('handles future (in / later / 后)', () => {
            expect(p('in 10m')).toBe(NOW_TIMESTAMP + 10 * minute);
            expect(p('2 hours later')).toBe(NOW_TIMESTAMP + 2 * hour);
            expect(p('10分钟后')).toBe(NOW_TIMESTAMP + 10 * minute);
            expect(p('10 分鐘後')).toBe(NOW_TIMESTAMP + 10 * minute);
        });

        it('handles abbreviated units', () => {
            expect(p('1y ago')).toBe(ms('2025-02-02T12:00:00'));
            expect(p('3mo ago')).toBe(ms('2025-11-02T12:00:00'));
            expect(p('2w ago')).toBe(NOW_TIMESTAMP - 2 * week);
            expect(p('5d ago')).toBe(NOW_TIMESTAMP - 5 * day);
        });

        it('does not read the "m" of a month as a minute', () => {
            expect(p('11 months ago')).toBe(ms('2025-03-02T12:00:00'));
            expect(p('11mo ago')).toBe(ms('2025-03-02T12:00:00'));
        });

        it('handles mixed units', () => {
            expect(p('1d 1h ago')).toBe(NOW_TIMESTAMP - (day + hour));
        });
    });

    /**
     * Category 3: Semantic Keywords & Strict Past Logic
     * Reference: Today is Monday, Feb 02.
     */
    describe('Semantic Keywords & Weekdays', () => {
        it('handles Today/Yesterday/Tomorrow', () => {
            expect(p('Today')).toBe(TODAY_START);
            expect(p('Yesterday')).toBe(YESTERDAY_START);
            expect(p('Tomorrow')).toBe(TOMORROW_START);
        });

        it('handles "Monday" (Strict Past: Today is Mon -> Last Mon)', () => {
            // Strict past rule: If input weekday is Same as today, go back 1 week.
            expect(p('Monday')).toBe(PREVIOUS_MONDAY);
            expect(p('周一')).toBe(PREVIOUS_MONDAY);
            expect(p('星期一')).toBe(PREVIOUS_MONDAY);
        });

        it('handles "Monday 3pm" (Strict Past)', () => {
            expect(p('Monday 3pm')).toBe(PREVIOUS_MONDAY + 15 * hour);
            expect(p('周一 15:00')).toBe(PREVIOUS_MONDAY + 15 * hour);
        });

        it('handles "Wednesday" (Strict Past: Wed is Future -> Last Wed)', () => {
            // Strict past rule: If input weekday is Future, go back 1 week.
            // Today is Mon Feb 02. Wed is Feb 04 (Future) -> Back 1 week -> Jan 28.
            expect(p('Wednesday')).toBe(PREVIOUS_WEDNESDAY);
            expect(p('周三')).toBe(PREVIOUS_WEDNESDAY);
        });

        it.each([
            ['Tuesday', '2026-01-27T00:00:00'],
            ['Tue', '2026-01-27T00:00:00'],
            ['Thursday', '2026-01-29T00:00:00'],
            ['Thu', '2026-01-29T00:00:00'],
            ['Tuesday 3pm', '2026-01-27T15:00:00'],
            ['Thu 10:00', '2026-01-29T10:00:00'],
        ])('parses %s as a past weekday instead of tomorrow', (input, expected) => {
            expect(p(input)).toBe(ms(expected));
        });

        it.each(['Tomorrow', 't'])('preserves %s as tomorrow with optional time', (input) => {
            expect(p(input)).toBe(TOMORROW_START);
            expect(p(`${input}3pm`)).toBe(TOMORROW_START + 15 * hour);
            expect(p(`${input} 10:00`)).toBe(TOMORROW_START + 10 * hour);
        });

        it('handles "Sunday" (Past: Sun is Yesterday -> Feb 01)', () => {
            // Sunday (Feb 01) is strictly before Monday (Feb 02).
            expect(p('Sunday')).toBe(LAST_SUNDAY);
        });

        it('handles "Friday" (Past: Fri is Jan 30)', () => {
            expect(p('Friday')).toBe(LAST_FRIDAY);
        });
    });

    /**
     * Category 4: Contextual & Combined Expressions
     */
    describe('Contextual & Formatted Time', () => {
        it('handles sticky AM/PM', () => {
            expect(p('Today 3pm')).toBe(TODAY_START + 15 * hour);
            expect(p('Yesterday 10pm')).toBe(YESTERDAY_START + 22 * hour);
        });

        it('handles spaced AM/PM', () => {
            expect(p('Today 3 pm')).toBe(TODAY_START + 15 * hour);
        });

        it('handles Chinese modifiers (Morning/Evening)', () => {
            // "明早" -> Tomorrow 8am
            expect(p('明早8点')).toBe(TOMORROW_START + 8 * hour);
            // "昨晚" -> Yesterday 8pm (20:00)
            expect(p('昨晚8点')).toBe(YESTERDAY_START + 20 * hour);
            // "周五下午3点" -> Last Friday 15:00
            expect(p('周五下午3点')).toBe(LAST_FRIDAY + 15 * hour);
            // https://github.com/DIYgod/RSSHub/issues/20878
            expect(p('昨天 23:01')).toBe(YESTERDAY_START + 23 * hour + 1 * minute);
        });

        it('handles 12am / 12pm edge cases', () => {
            expect(p('Today 12pm')).toBe(TODAY_START + 12 * hour); // Noon
            expect(p('Today 12am')).toBe(TODAY_START); // Midnight
        });
    });

    /**
     * Category 5: Edge Cases & Fallback
     */
    describe('Fallback', () => {
        it('passes the format to parseDate', () => {
            const str = '05/02/2026';
            const format = 'DD/MM/YYYY'; // Feb 5th
            expect(p(str, format)).toBe(ms('2026-02-05T00:00:00'));
        });

        it('returns raw absolute dates', () => {
            expect(p('2026-01-01T00:00:00')).toBe(ms('2026-01-01T00:00:00'));
        });

        it('returns undefined for an empty or unparseable string', () => {
            expect(p('')).toBeUndefined();
            expect(p('unknown')).toBeUndefined();
        });
    });

    /**
     * Category 6: Time zone
     * Reference: 2026-02-02T12:00Z is 20:00 in UTC+8 and 21:00 in Tokyo.
     */
    describe('Time zone', () => {
        it('starts the day of a keyword in the given zone', () => {
            expect(parseRelativeDate('今天', 8)?.epochMilliseconds).toBe(ms('2026-02-01T16:00:00'));
            expect(p('昨天 23:01', undefined, 'Asia/Tokyo')).toBe(ms('2026-02-01T14:01:00'));
        });

        it('does not shift a duration by the zone', () => {
            expect(parseRelativeDate('10分钟前', 8)?.epochMilliseconds).toBe(NOW_TIMESTAMP - 10 * minute);
        });

        it('applies the zone to the fallback', () => {
            expect(p('2026-01-01 08:00', 'YYYY-MM-DD HH:mm', 8)).toBe(ms('2026-01-01T00:00:00'));
        });
    });

    describe('Multi-line and long input', () => {
        it('reads a duration from the last line only', () => {
            expect(p('2 days left\n3 hours ago')).toBe(NOW_TIMESTAMP - 3 * hour);
            expect(p('2 days left\r\n3小时后')).toBe(NOW_TIMESTAMP + 3 * hour);
        });

        it.each(['1'.repeat(20000) + '前', '1'.repeat(20000), 'b'.repeat(40000), '今天' + '1'.repeat(20000)])('does not spend quadratic time on long input', (str) => {
            const started = performance.now();
            expect(p(str)).toBeUndefined();
            expect(performance.now() - started).toBeLessThan(500);
        });
    });
});
