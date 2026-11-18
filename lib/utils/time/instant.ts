import { formatDate } from './format';
import { parseDate } from './parse-date';

/** Converts an instant, a timestamp in milliseconds or a date string to an instant. */
export const toInstant = (value: Temporal.Instant | number | string): Temporal.Instant | undefined => (value instanceof Temporal.Instant ? value : parseDate(value));

const toEpochMilliseconds = (value: Temporal.Instant | number | string | null | undefined) => (value === null || value === undefined ? undefined : toInstant(value)?.epochMilliseconds) ?? 0;

/**
 * Compares two dates for a sort: negative when `a` is the earlier one. Newest first is `compareDates(b, a)`. The values are what `toInstant` takes. A missing or unparseable date sorts as the Unix epoch.
 */
export const compareDates = (a: Temporal.Instant | number | string | null | undefined, b: Temporal.Instant | number | string | null | undefined): number => toEpochMilliseconds(a) - toEpochMilliseconds(b);

/** Formats an instant as an RFC 822 date in GMT, i.e., `Tue, 05 Mar 2024 10:00:00 GMT`. */
export const toRFC822 = (instant: Temporal.Instant): string => formatDate(instant, 'ddd, DD MMM YYYY HH:mm:ss [GMT]');

/** Formats an instant as ISO 8601 in UTC with milliseconds, i.e., `2024-03-05T10:00:00.000Z`. */
export const toISOString = (instant: Temporal.Instant): string => instant.toString({ fractionalSecondDigits: 3 });
