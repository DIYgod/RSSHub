import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Interpret a source's wall clock without using the host's timezone. Dates,
// timestamps and ISO strings with an explicit offset already identify an instant.
export const parseDateInTimezone = (date: string | number | Date, offset: number): Date => {
    const parsed = dayjs.utc(date);
    if (typeof date !== 'string' || /(?:Z|[+-]\d{2}:?\d{2}|(?:GMT|UTC)(?:[+-]\d{1,4})?)$/i.test(date.trim())) {
        return parsed.toDate();
    }
    return parsed.subtract(offset, 'hour').toDate();
};
