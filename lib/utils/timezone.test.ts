import { afterEach, describe, expect, it, vi } from 'vitest';

import timezone from '@/utils/timezone';

const ORIGINAL_TZ = process.env.TZ;

/**
 * Re-imports the module under a given IANA zone and system time, mirroring a
 * server that booted in that zone at that moment.
 */
const loadUnder = async (tz: string, now?: string) => {
    process.env.TZ = tz;
    if (now) {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(now));
    }
    vi.resetModules();
    const { default: convert } = await import('@/utils/timezone');
    const { parseDate } = await import('@/utils/parse-date');
    if (now) {
        vi.useRealTimers();
    }
    return { convert, parseDate };
};

describe('timezone', () => {
    afterEach(() => {
        // assigning undefined would set TZ to the string "undefined", which resolves to UTC
        if (ORIGINAL_TZ === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = ORIGINAL_TZ;
        }
        vi.useRealTimers();
        vi.resetModules();
    });

    it('timezone', () => {
        const date = new Date('2024-01-01T01:01:01Z');
        const serverTimezone = -date.getTimezoneOffset() / 60;
        expect(timezone(date, serverTimezone - 1).toISOString()).toEqual('2024-01-01T02:01:01.000Z');
    });

    it('timezone with string input', () => {
        const serverTimezone = -new Date('2024-01-01T01:01:01Z').getTimezoneOffset() / 60;
        expect(timezone('2024-01-01T01:01:01Z', serverTimezone).toISOString()).toEqual('2024-01-01T01:01:01.000Z');
    });

    it('applies the offset in effect at the converted date, not the one at import time', async () => {
        const { convert, parseDate } = await loadUnder('America/New_York');

        // 2025-01-15 is EST (UTC-5), 2025-07-15 is EDT (UTC-4). Both wall clocks
        // are declared to be UTC+0, so both must round-trip unchanged.
        expect(convert(parseDate('2025-01-15 12:00:00', 'YYYY-MM-DD HH:mm:ss'), 0).toISOString()).toBe('2025-01-15T12:00:00.000Z');
        expect(convert(parseDate('2025-07-15 12:00:00', 'YYYY-MM-DD HH:mm:ss'), 0).toISOString()).toBe('2025-07-15T12:00:00.000Z');
    });

    it('does not depend on when the process was started', async () => {
        const winterBoot = await loadUnder('Europe/Berlin', '2025-01-10T00:00:00Z');
        const summerBoot = await loadUnder('Europe/Berlin', '2025-07-10T00:00:00Z');

        const sample = '2025-03-20 09:30:00';
        const fromWinterBoot = winterBoot.convert(winterBoot.parseDate(sample, 'YYYY-MM-DD HH:mm:ss'), 8).toISOString();
        const fromSummerBoot = summerBoot.convert(summerBoot.parseDate(sample, 'YYYY-MM-DD HH:mm:ss'), 8).toISOString();

        expect(fromWinterBoot).toBe(fromSummerBoot);
        expect(fromWinterBoot).toBe('2025-03-20T01:30:00.000Z');
    });

    it('is independent of the server timezone', async () => {
        // sequential on purpose: `loadUnder` mutates the shared process timezone
        const convertUnder = async (tz: string) => {
            const { convert, parseDate } = await loadUnder(tz);
            return convert(parseDate('2025-01-15 12:00:00', 'YYYY-MM-DD HH:mm:ss'), 0).toISOString();
        };

        expect({
            UTC: await convertUnder('UTC'),
            'America/New_York': await convertUnder('America/New_York'),
            'Europe/Berlin': await convertUnder('Europe/Berlin'),
            'Asia/Shanghai': await convertUnder('Asia/Shanghai'),
            'Australia/Sydney': await convertUnder('Australia/Sydney'),
        }).toEqual({
            UTC: '2025-01-15T12:00:00.000Z',
            'America/New_York': '2025-01-15T12:00:00.000Z',
            'Europe/Berlin': '2025-01-15T12:00:00.000Z',
            'Asia/Shanghai': '2025-01-15T12:00:00.000Z',
            'Australia/Sydney': '2025-01-15T12:00:00.000Z',
        });
    });
});
