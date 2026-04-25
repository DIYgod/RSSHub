import dayjs from 'dayjs';
import MockDate from 'mockdate';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseRelativeTime } from '../../lib/utils/parse-relative-time';

describe('parseRelativeTime', () => {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    const BASE_STR = '2026-04-25T12:00:00';
    const NOW_TIMESTAMP = new Date(BASE_STR).getTime();

    const p = (str: string) => new Date(parseRelativeTime(str)).getTime();

    beforeEach(() => {
        MockDate.set(NOW_TIMESTAMP);
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('Immediate Time', () => {
        it('handles "刚刚"', () => {
            const expected = NOW_TIMESTAMP - 3 * second;
            expect(p('刚刚')).toBe(expected);
        });
    });

    describe('Relative Durations', () => {
        it('handles "5分钟前"', () => {
            expect(p('5分钟前')).toBe(NOW_TIMESTAMP - 5 * minute);
        });

        it('handles "3小时前"', () => {
            expect(p('3小时前')).toBe(NOW_TIMESTAMP - 3 * hour);
        });

        it('handles "2天前"', () => {
            expect(p('2天前')).toBe(NOW_TIMESTAMP - 2 * day);
        });

        it('handles "10秒前"', () => {
            expect(p('10秒前')).toBe(NOW_TIMESTAMP - 10 * second);
        });
    });

    describe('Chinese Numerals', () => {
        it('handles "一分钟前" (one minute ago)', () => {
            expect(p('一分钟前')).toBe(NOW_TIMESTAMP - 1 * minute);
        });

        it('handles "两小时前" (two hours ago)', () => {
            expect(p('两小时前')).toBe(NOW_TIMESTAMP - 2 * hour);
        });

        it('handles "三天前" (three days ago)', () => {
            expect(p('三天前')).toBe(NOW_TIMESTAMP - 3 * day);
        });
    });

    describe('Vague Quantifiers', () => {
        it('handles "几分钟前" (a few minutes ago)', () => {
            expect(p('几分钟前')).toBe(NOW_TIMESTAMP - 3 * minute);
        });
    });

    describe('Edge Cases', () => {
        it('returns current time for empty string', () => {
            expect(p('')).toBe(NOW_TIMESTAMP);
        });

        it('returns current time for unrecognized format', () => {
            expect(p('unknown format')).toBe(NOW_TIMESTAMP);
        });
    });

    describe('ISO 8601 Format', () => {
        it('returns valid ISO 8601 format', () => {
            const result = parseRelativeTime('刚刚');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('returns valid ISO 8601 format for relative time', () => {
            const result = parseRelativeTime('5分钟前');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });
    });
});
