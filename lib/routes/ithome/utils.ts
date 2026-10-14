import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const parseSourceDate = (value?: string) => {
    const parts = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})$/.exec(value ?? '');
    if (!parts) {
        return;
    }
    const [, year, month, day, hour, minute, second] = parts;
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}:${second}`;
    if (!Number.isFinite(parseDate(date, 'YYYY-MM-DD HH:mm:ss', true).getTime())) {
        return;
    }
    return parseDateInTimezone(date, 8);
};
