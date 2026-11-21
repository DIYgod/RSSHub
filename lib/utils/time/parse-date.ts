import type { DateFields, TimeZone } from './fields';
import { fieldsToInstant } from './fields';
import { parseLenient, parseStrict } from './parse-format';

type Format = string | string[];

// No date is anywhere near this long, and the lenient format match and the patterns below take quadratic time on a long input
export const MAX_DATE_LENGTH = 256;

// A date with no offset: `2024`, `2024-03`, `2024-03-05`, and a time only after a full date: `2024/3/5 10:00`, `2024-03-05T10:00:00.123`
const WALL_CLOCK = /^(\d{4})(?:[-/](\d{1,2})(?:[-/](\d{1,2})(?:[T\s]+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.:](\d+))?)?)?)?)?)?$/i;
// The same with no separators: `20240305`, `20240305T100000`, `202403051000`
const WALL_CLOCK_COMPACT = /^(\d{4})(\d{2})(\d{2})(?:[T\s]?(\d{2}):?(\d{2})(?::?(\d{2}))?)?$/i;

// RFC 2822 and HTTP dates: `Tue, 05 Mar 2024 10:00:00 GMT`, `5 Mar 2024 10:00 +0800`, `05 March 2024`, and the two-digit years of RFC 822: `Tue, 05 Mar 24 10:00:00 GMT`
const RFC_2822 = /^(?:[a-z]{3,9},?\s+)?(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4}|\d{2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(?:(z|ut|gmt|utc|[ecmp][sd]t)\s*)?([+-]\d{1,2}(?::?\d{2})?)?$/i;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// The North American zones of RFC 2822, in hours
const ZONE_ABBREVIATIONS = new Map([
    ['est', -5],
    ['edt', -4],
    ['cst', -6],
    ['cdt', -5],
    ['mst', -7],
    ['mdt', -6],
    ['pst', -8],
    ['pdt', -7],
]);

const toNumber = (value: string | undefined) => (value ? Number(value) : undefined);

const epoch = (milliseconds: number): Temporal.Instant | undefined => {
    try {
        return Temporal.Instant.fromEpochMilliseconds(Math.trunc(milliseconds));
    } catch {
        return undefined;
    }
};

const parseRfc2822 = (input: string): DateFields | undefined => {
    const match = RFC_2822.exec(input);
    const month = match ? MONTHS.indexOf(match[2].toLowerCase()) + 1 : 0;
    if (!match || !month) {
        return undefined;
    }
    const [, day, , year, hour, minute, second, zone, offset] = match;
    let offsetMinutes: number | undefined;
    if (offset) {
        const [, sign, hours, minutes] = /([+-])(\d{1,2}):?(\d{2})?/.exec(offset)!;
        offsetMinutes = (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes ?? 0));
    } else if (zone) {
        offsetMinutes = (ZONE_ABBREVIATIONS.get(zone.toLowerCase()) ?? 0) * 60;
    }
    // RFC 2822 section 4.3: a two-digit year from 00 to 49 is 20xx, from 50 to 99 is 19xx
    const fullYear = year.length === 2 ? Number(year) + (Number(year) < 50 ? 2000 : 1900) : Number(year);
    return { year: fullYear, month, day: Number(day), hour: toNumber(hour), minute: toNumber(minute), second: toNumber(second), offsetMinutes };
};

const parseUnformatted = (input: string, timeZone?: TimeZone): Temporal.Instant | undefined => {
    const text = input.trim();
    const wallClock = WALL_CLOCK.exec(text) ?? WALL_CLOCK_COMPACT.exec(text);
    if (wallClock) {
        const [year, month, day, hour, minute, second] = wallClock.slice(1, 7).map((value) => toNumber(value));
        return fieldsToInstant({ year, month: month ?? 1, day: day ?? 1, hour, minute, second, millisecond: toNumber(wallClock[7]?.slice(0, 3).padEnd(3, '0')) }, timeZone);
    }
    try {
        // ISO 8601 with an offset; Temporal does not accept a space before the offset
        return Temporal.Instant.from(text.replace(/\s+(?=(?:z|[+-]\d{2}(?::?\d{2})?)$)/i, ''));
    } catch {
        const fields = parseRfc2822(text);
        return fields && fieldsToInstant(fields, timeZone);
    }
};

const parse = (input: string | number, format: Format | undefined, timeZone: TimeZone | undefined, strict: boolean): Temporal.Instant | undefined => {
    if (!input || (typeof input === 'string' && input.length > MAX_DATE_LENGTH)) {
        return undefined;
    }
    if (typeof input !== 'string' && typeof input !== 'number') {
        throw new TypeError(`Expected a date string or a timestamp, got ${Object.prototype.toString.call(input)}`);
    }
    if (format === undefined) {
        return typeof input === 'number' ? epoch(input) : parseUnformatted(input, timeZone);
    }
    const formats = typeof format === 'string' ? [format] : format;
    for (const candidate of formats) {
        let instant: Temporal.Instant | undefined;
        if (candidate === 'X' || candidate === 'x') {
            instant = input === '' ? undefined : epoch(Number(input) * (candidate === 'X' ? 1000 : 1));
        } else if (typeof input === 'string') {
            const fields = strict ? parseStrict(input, candidate) : parseLenient(input, candidate);
            instant = fields && fieldsToInstant(fields, timeZone);
        }
        if (instant) {
            return instant;
        }
    }
    return undefined;
};

/**
 * Parses a date to an instant.
 *
 * - A number is a timestamp in milliseconds.
 * - Empty input (`''`, `undefined`, `null`, `0`) gives `undefined`. A value of another type throws a `TypeError`.
 * - A string longer than `MAX_DATE_LENGTH` is not parsed and gives `undefined`.
 * - With no format, the string must be ISO 8601 (`2024-03-05T10:00:00+08:00`, `2024-03-05 10:00`, `2024/3/5`) or an RFC 2822 / HTTP date (`Tue, 05 Mar 2024 10:00:00 GMT`). All other layouts need a format.
 * - A format uses the dayjs tokens (`YYYY-MM-DD HH:mm`); `X` and `x` are timestamps in seconds and milliseconds. With an array of formats, the first format that parses wins.
 *
 * The format match is lenient: separators are not compared and text after the last token is ignored. Use {@link parseDateStrict} when the format must describe the full input.
 *
 * @param input - The date string or the timestamp.
 * @param format - The format or formats. A number in this position is the time zone offset.
 * @param timeZone - The zone of the input when the input has no offset of its own: an offset in hours (`8`, `-3.5`) or an IANA id (`'Asia/Shanghai'`). Default: UTC. The time zone of the host has no effect.
 * @returns The instant, or `undefined` when the input does not parse.
 */
export function parseDate(input: string | number, timeZone: number): Temporal.Instant | undefined;
export function parseDate(input: string | number, format?: Format, timeZone?: TimeZone): Temporal.Instant | undefined;
export function parseDate(input: string | number, format?: Format | number, timeZone?: TimeZone): Temporal.Instant | undefined {
    return typeof format === 'number' ? parse(input, undefined, format, false) : parse(input, format, timeZone, false);
}

/**
 * Parses a date to an instant. The format must describe the full input: separators are compared, `MM` needs two digits and `M` rejects a leading zero, and no text can follow the last token.
 *
 * @param input - The date string, or a timestamp for the `X` and `x` formats.
 * @param format - The format or formats, in dayjs tokens. With an array, the first format that parses wins.
 * @param timeZone - The zone of the input when the input has no offset of its own. Default: UTC.
 * @returns The instant, or `undefined` when the input does not match a format.
 */
export const parseDateStrict = (input: string | number, format: Format, timeZone?: TimeZone): Temporal.Instant | undefined => parse(input, format, timeZone, true);
