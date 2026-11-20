import type { TimeZone } from './fields';
import { toTimeZoneId } from './fields';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

const ordinal = (day: number) => {
    const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][day % 10] ?? 'th');
    return `${day}${suffix}`;
};

const offset = (seconds: number, separator: string) => {
    const minutes = Math.round(Math.abs(seconds) / 60);
    return `${seconds < 0 ? '-' : '+'}${pad(Math.trunc(minutes / 60))}${separator}${pad(minutes % 60)}`;
};

const TOKENS = {
    YYYY: (date) => pad(date.year, 4),
    YY: (date) => pad(date.year % 100),
    MMMM: (date) => MONTHS[date.month - 1],
    MMM: (date) => MONTHS[date.month - 1].slice(0, 3),
    MM: (date) => pad(date.month),
    M: (date) => String(date.month),
    Do: (date) => ordinal(date.day),
    DD: (date) => pad(date.day),
    D: (date) => String(date.day),
    dddd: (date) => WEEKDAYS[date.dayOfWeek - 1],
    ddd: (date) => WEEKDAYS[date.dayOfWeek - 1].slice(0, 3),
    d: (date) => String(date.dayOfWeek % 7),
    HH: (date) => pad(date.hour),
    H: (date) => String(date.hour),
    hh: (date) => pad(date.hour % 12 || 12),
    h: (date) => String(date.hour % 12 || 12),
    mm: (date) => pad(date.minute),
    m: (date) => String(date.minute),
    ss: (date) => pad(date.second),
    s: (date) => String(date.second),
    SSS: (date) => pad(date.millisecond, 3),
    A: (date) => (date.hour < 12 ? 'AM' : 'PM'),
    a: (date) => (date.hour < 12 ? 'am' : 'pm'),
    z: (date) => new Intl.DateTimeFormat('en-US', { timeZone: date.timeZoneId, timeZoneName: 'short' }).formatToParts(date.epochMilliseconds).find((part) => part.type === 'timeZoneName')!.value,
    ZZ: (date) => offset(date.offsetNanoseconds / 1e9, ''),
    Z: (date) => offset(date.offsetNanoseconds / 1e9, ':'),
    X: (date) => String(Math.floor(date.epochMilliseconds / 1000)),
    x: (date) => String(date.epochMilliseconds),
} satisfies Record<string, (date: Temporal.ZonedDateTime) => string>;

const isToken = (token: string): token is keyof typeof TOKENS => Object.hasOwn(TOKENS, token);

const PATTERN = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|Do|DD|D|dddd|ddd|d|HH|H|hh|h|mm|m|ss|[sAa]|SSS|ZZ|[XZxz]/g;

/**
 * Formats a date with the dayjs format tokens, the same tokens that `parseDate` reads.
 *
 * Tokens: `YYYY` `YY` year, `M` `MM` `MMM` `MMMM` month, `D` `DD` `Do` day, `d` `ddd` `dddd` weekday, `H` `HH` `h` `hh` hour, `m` `mm` minute, `s` `ss` second, `SSS` millisecond, `A` `a` AM/PM, `Z` `ZZ` offset, `z` zone abbreviation
 * (`EST`, `GMT+8`), `X` `x` timestamp in seconds and milliseconds. Text in `[...]` is kept as it is. Month and weekday names are English.
 *
 * @param date - The instant, or a zoned date-time (its own zone is used).
 * @param format - The format, e.g. `'YYYY-MM-DD HH:mm'`.
 * @param timeZone - The zone of an instant: an offset in hours (`8`) or an IANA id (`'Asia/Shanghai'`). Default: UTC.
 */
export const formatDate = (date: Temporal.Instant | Temporal.ZonedDateTime, format: string, timeZone?: TimeZone): string => {
    const zoned = date instanceof Temporal.Instant ? date.toZonedDateTimeISO(toTimeZoneId(timeZone)) : date;
    return format.replaceAll(PATTERN, (token, literal?: string) => literal ?? (isToken(token) ? TOKENS[token](zoned) : token));
};
