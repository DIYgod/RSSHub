import { config } from '@/config';
import { formatDate, parseDate } from '@/utils/time';

export const parseSearchDate = (value: string, now = Temporal.Now.instant()): Temporal.Instant | undefined => {
    const today = formatDate(now, 'YYYY-MM-DD', 8);
    if (/^\d{2}:\d{2}$/.test(value)) {
        return parseDate(`${today}T${value}`, 8);
    }
    if (!/^\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
        return;
    }

    // Search results omit the year; a later month/day belongs to last year.
    const year = Number(today.slice(0, 4)) - Number(value.slice(0, 5) > today.slice(5));
    return parseDate(`${year}-${value}`, 8);
};

export const getHeaders = (): Record<string, string> => (config.smzdm.cookie ? { cookie: config.smzdm.cookie } : {});
