import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday.js';
import MockDate from 'mockdate';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseRelativeDate } from './parse-date';

dayjs.extend(weekday);

describe('parseRelativeDate', () => {
    // === CONSTANTS ===
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    // === BASE DATE SETUP: 2026-02-02 (Monday) ===
    const BASE_STR = '2026-02-02T12:00:00';
    const NOW_TIMESTAMP = new Date(BASE_STR).getTime();

    // Derived Timestamps
    const TODAY_START = new Date('2026-02-02T00:00:00').getTime();
    const YESTERDAY_START = TODAY_START - day;
    const TOMORROW_START = TODAY_START + day;

    // Strict Past Logic Expectations (Reference is Mon Feb 02)
    const PREVIOUS_MONDAY = TODAY_START - week; // Jan 26 (Last week)
    const PREVIOUS_WEDNESDAY = TODAY_START + 2 * day - week; // Jan 28 (Last week)
    const LAST_SUNDAY = new Date('2026-02-01T00:00:00').getTime(); // Yesterday (Feb 01)
    const LAST_FRIDAY = new Date('2026-01-30T00:00:00').getTime(); // Last Friday (Jan 30)

    const p = (str: string, ...opts: any[]) => parseRelativeDate(str, ...opts).getTime();

    beforeEach(() => {
        MockDate.set(NOW_TIMESTAMP);
    });

    afterEach(() => {
        MockDate.reset();
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
        it('passes formatting options to dayjs', () => {
            const str = '05/02/2026';
            const format = 'DD/MM/YYYY'; // Feb 5th
            const expected = new Date('2026-02-05T00:00:00').getTime();
            expect(p(str, format)).toBe(expected);
        });

        it('returns raw absolute dates', () => {
            const raw = '2026-01-01T00:00:00';
            expect(p(raw)).toBe(new Date(raw).getTime());
        });
    });
});
