import { parseDate, parseDateStrict } from '@/utils/time';

export const parseSourceDate = (value?: string) => {
    const parts = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})$/.exec(value ?? '');
    if (!parts) {
        return;
    }
    const [, year, month, day, hour, minute, second] = parts;
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}:${second}`;
    if (!parseDateStrict(date, 'YYYY-MM-DD HH:mm:ss')) {
        return;
    }
    return parseDate(date, 8);
};
