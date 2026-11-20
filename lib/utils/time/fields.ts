/** An offset from UTC in hours (`8`, `-3.5`) or an IANA time zone id (`'Asia/Shanghai'`). */
export type TimeZone = number | string;

export interface DateFields {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    /** Offset from UTC in minutes, when the input carries its own offset. */
    offsetMinutes?: number;
}

const pad = (value: number) => String(value).padStart(2, '0');

export const toTimeZoneId = (timeZone: TimeZone = 'UTC'): string => {
    if (typeof timeZone === 'string') {
        return timeZone;
    }
    const minutes = Math.round(Math.abs(timeZone) * 60);
    return `${timeZone < 0 ? '-' : '+'}${pad(Math.trunc(minutes / 60))}:${pad(minutes % 60)}`;
};

export const now = (timeZone?: TimeZone): Temporal.ZonedDateTime => Temporal.Now.instant().toZonedDateTimeISO(toTimeZoneId(timeZone));

/**
 * Resolves wall-clock fields to an instant. An offset in the fields wins over `timeZone`.
 * Missing date fields default like dayjs: the current year, then the current month and day when the input has no larger unit, else the first one.
 *
 * @returns `undefined` when a field is out of range (month 13, February 30).
 */
export const fieldsToInstant = (fields: DateFields, timeZone?: TimeZone): Temporal.Instant | undefined => {
    const zone = fields.offsetMinutes === undefined ? (timeZone ?? 0) : fields.offsetMinutes / 60;
    // An offset in hours is plain arithmetic, so a number that is not an offset of a real zone (-33) works too
    const offsetMilliseconds = typeof zone === 'number' ? Math.round(zone * 60 * 60 * 1000) : undefined;
    const { year, month, day } = fields;
    let today: Temporal.ZonedDateTime | undefined;
    if (!(year && month && day)) {
        today = offsetMilliseconds === undefined ? now(zone) : Temporal.Now.instant().add({ milliseconds: offsetMilliseconds }).toZonedDateTimeISO('UTC');
    }
    let dateTime: Temporal.PlainDateTime;
    try {
        dateTime = Temporal.PlainDateTime.from(
            {
                year: year || today!.year,
                month: month || (year ? 1 : today!.month),
                day: day || (year || month ? 1 : today!.day),
                hour: fields.hour,
                minute: fields.minute,
                second: fields.second,
                millisecond: fields.millisecond,
            },
            { overflow: 'reject' }
        );
    } catch {
        return undefined;
    }
    return offsetMilliseconds === undefined ? dateTime.toZonedDateTime(zone as string).toInstant() : dateTime.toZonedDateTime('UTC').toInstant().subtract({ milliseconds: offsetMilliseconds });
};
