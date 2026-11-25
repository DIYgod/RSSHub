import type { TimeZone } from './fields';
import { fieldsToInstant } from './fields';

interface CalendarDate {
    /** A calendar that Temporal has: `roc`, `buddhist`, `japanese`, `persian`, `islamic-umalqura`, `hebrew`, ... */
    calendar: string;
    /** The era code of the calendar (`reiwa`, `heisei`, `showa`). With an era, `year` is the year of the era. */
    era?: string;
    year: number | string;
    month: number | string;
    day: number | string;
    hour?: number | string;
    minute?: number | string;
}

/**
 * Converts a date of a calendar that is not the Gregorian calendar to an instant.
 *
 * @param date - The fields of the date in its own calendar, as numbers or numeric strings, e.g., `{ calendar: 'roc', year: 115, month: 8, day: 31 }`.
 * @param timeZone - The zone of the date: an offset in hours (`8`) or an IANA id (`'Asia/Taipei'`). Default: UTC.
 * @returns The instant, or `undefined` when the date is not in the calendar (an unknown era, month 13, a field that is not a number).
 */
export const calendarToInstant = ({ calendar, era, year, month, day, hour = 0, minute = 0 }: CalendarDate, timeZone?: TimeZone): Temporal.Instant | undefined => {
    let date: Temporal.PlainDateTime;
    try {
        date = Temporal.PlainDateTime.from(
            { calendar, ...(era ? { era, eraYear: Number(year) } : { year: Number(year) }), month: Number(month), day: Number(day), hour: Number(hour), minute: Number(minute) },
            { overflow: 'reject' }
        ).withCalendar('iso8601');
    } catch {
        return undefined;
    }
    return fieldsToInstant({ year: date.year, month: date.month, day: date.day, hour: date.hour, minute: date.minute }, timeZone);
};
