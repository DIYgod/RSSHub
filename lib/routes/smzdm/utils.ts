import { config } from '@/config';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const parseSearchDate = (value: string, now = new Date()): Date | undefined => {
    const today = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (/^\d{2}:\d{2}$/.test(value)) {
        return parseDateInTimezone(`${today}T${value}`, 8);
    }
    if (/^\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
        // Search results omit the year; a later month/day belongs to last year.
        const year = Number(today.slice(0, 4)) - Number(value.slice(0, 5) > today.slice(5));
        return parseDateInTimezone(`${year}-${value}`, 8);
    }
};

export const getHeaders = () => ({
    accept: 'application/json, text/javascript, */*; q=0.01',
    cookie: config.smzdm.cookie!,
    'x-requested-with': 'XMLHttpRequest',
});
