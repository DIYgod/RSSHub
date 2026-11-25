import type { TimeZone } from './fields';
import { fieldsToInstant, now } from './fields';
import { MAX_DATE_LENGTH, parseDate } from './parse-date';
import { parseLenient } from './parse-format';

/**
 * Defines a pattern for semantic date keywords.
 */
interface KeywordDefinition {
    /**
     * Regular expression to match the keyword (e.g., "Yesterday", "Monday", "周一").
     */
    regExp: RegExp;
    /**
     * Offset of the base date from today, in days.
     */
    calc: (today: Temporal.ZonedDateTime) => number;
}

/**
 * Defines a pattern for extracting time units from a string.
 */
interface UnitPattern {
    /**
     * The unit of the duration (e.g., 'days', 'hours').
     */
    unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';
    /**
     * Regular expression to match value and unit in the input string.
     */
    regExp: RegExp;
}

// === Pre-compiled Regular Expressions ===

// The lookbehinds pin each greedy `.*` / `\d+` to the start of its run. They match the same text without them,
// but a run that fails to match is then retried from every offset inside it, which takes quadratic time.
const REGEX_JUST_NOW = /^(?:just\s?now|刚刚|剛剛)$/i;
const REGEX_AGO = /(?<!.)(.*)(?:ago|前)$/i;
const REGEX_IN = /^in\s*(.*)|(?<!.)(.*)(?:later|after|[后後])$/i;
const REGEX_STICKY_AMPM = /(?<!\d)(\d+)\s*(a|p)m$/i;
const REGEX_IS_PM = /下午|晚上|晚|pm|p\.m\./i;
const REGEX_IS_AM = /上午|凌晨|早|晨|am|a\.m\./i;

const UNIT_PATTERNS: UnitPattern[] = [
    { unit: 'years', regExp: /(?<!\d)(\d+)\s*(?:年|y(?:(?:ea)?rs?)?)/i },
    { unit: 'months', regExp: /(?<!\d)(\d+)\s*(?:[个個]?月|mo(?:n(?:th)?s?)?)/i },
    { unit: 'weeks', regExp: /(?<!\d)(\d+)\s*(?:周|[个個]?星期|w(?:(?:ee)?ks?)?)/i },
    { unit: 'days', regExp: /(?<!\d)(\d+)\s*(?:天|日|d(?:ay)?s?)/i },
    { unit: 'hours', regExp: /(?<!\d)(\d+)\s*(?:[个個]?(?:小?时|[時点點])|h(?:(?:ou)?r)?s?)/i },
    // The lookahead keeps the bare `m` from also matching the `mo` of a month
    { unit: 'minutes', regExp: /(?<!\d)(\d+)\s*(?:分[鐘钟]?|m(?:in(?:ute)?)?s?(?![a-z]))/i },
    { unit: 'seconds', regExp: /(?<!\d)(\d+)\s*(?:秒[鐘钟]?|s(?:ec(?:ond)?)?s?)/i },
];

const CN_NUM_MAP = new Map([
    ['一', '1'],
    ['二', '2'],
    ['两', '2'],
    ['三', '3'],
    ['四', '4'],
    ['五', '5'],
    ['六', '6'],
    ['七', '7'],
    ['八', '8'],
    ['九', '9'],
    ['十', '10'],
]);

/**
 * Calculates the offset to the most recent occurrence of a specific weekday.
 *
 * If the target weekday is the same as today or occurs later in the current week, it returns the offset to the day in the previous week.
 *
 * @param targetDay - The day index: 1 (Monday) to 7 (Sunday).
 * @returns The offset from today, in days (always negative).
 */
const lastWeekday =
    (targetDay: number) =>
    (today: Temporal.ZonedDateTime): number => {
        const days = targetDay - today.dayOfWeek;
        // If the target day is today or in the future (within the standard week cycle),
        // backtrack 7 days to find the previous occurrence.
        return days >= 0 ? days - 7 : days;
    };

// Semantic Keywords configuration
const KEYWORDS: KeywordDefinition[] = [
    {
        regExp: /^(?:今[天日早晨晚]|to?day?)/i,
        calc: () => 0,
    },
    {
        regExp: /^(?:昨[天日早晨晚]|y(?:ester)?day?)/i,
        calc: () => -1,
    },
    {
        regExp: /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)/i,
        calc: () => -2,
    },
    {
        regExp: /^(?:明[天日早晨晚]|t(?:omorrow|(?![a-z])))/i,
        calc: () => 1,
    },
    {
        regExp: /^(?:[后後][天日]|(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?)/i,
        calc: () => 2,
    },
    // Weekdays (English + Chinese)
    { regExp: /^(?:mon(?:day)?|(?:周|星期)[1一])/i, calc: lastWeekday(1) },
    { regExp: /^(?:tue(?:sday)?|(?:周|星期)[2二两])/i, calc: lastWeekday(2) },
    { regExp: /^(?:wed(?:nesday)?|(?:周|星期)[3三])/i, calc: lastWeekday(3) },
    { regExp: /^(?:thu(?:rsday)?|(?:周|星期)[4四])/i, calc: lastWeekday(4) },
    { regExp: /^(?:fri(?:day)?|(?:周|星期)[5五])/i, calc: lastWeekday(5) },
    { regExp: /^(?:sat(?:urday)?|(?:周|星期)[6六])/i, calc: lastWeekday(6) },
    { regExp: /^(?:sun(?:day)?|(?:周|星期)[7日天])/i, calc: lastWeekday(7) },
];

/**
 * Normalizes the input string to a format suitable for parsing.
 *
 * Operations performed:
 * - Lowercasing and trimming.
 * - Converting English articles/quantifiers ('a', 'an', 'x') to numbers.
 * - Converting Chinese numerals and quantifiers to Arabic numbers.
 * - Removing punctuation (commas).
 *
 * @param date - The raw date string to normalize.
 * @returns The normalized string.
 */
const normalize = (date: string): string => {
    let str = date.toLowerCase().trim();

    if (REGEX_JUST_NOW.test(str)) {
        return 'just now';
    }

    // 1. Quantifiers: 'a'/'an' -> '1'
    str = str.replaceAll(/(^|\s)an?(\s)/g, '$11$2');

    // 2. Vague 'x' (English needs boundary)
    str = str.replaceAll(/(^|\s)x(\s|$)/g, '$13$2');

    // 3. Vague Chinese '几/数' (No boundary needed)
    str = str.replaceAll(/[几幾数]/g, '3');

    // 4. Chinese numerals
    str = str.replaceAll(/[一二两三四五六七八九十]/g, (match) => CN_NUM_MAP.get(match) ?? match);

    // 5. Remove commas
    str = str.replaceAll(',', '');

    return str;
};

/**
 * Parses a string to extract the total duration based on predefined unit patterns.
 *
 * @param str - The string containing time units (e.g., "1 hour 30 mins").
 * @returns The duration, blank when the string has no unit.
 */
const parseDuration = (str: string): Temporal.Duration => {
    // `Temporal.Duration.from` throws on an object with no unit
    const units: Temporal.DurationLike = { seconds: 0 };
    // Remove spaces for regex unit matching
    const cleanStr = str.replaceAll(/\s+/g, '');

    for (const { unit, regExp } of UNIT_PATTERNS) {
        const match = regExp.exec(cleanStr);
        if (match) {
            units[unit] = Number(match[1]);
        }
    }
    return Temporal.Duration.from(units);
};

const MILLIS_IN_AN_HOUR = 60 * 60 * 1000;
const TIME_FORMATS = ['HH:mm:ss', 'HH:mm', 'H:m', 'h:m a', 'h a'];

/**
 * Processes a date string composed of a semantic keyword and an optional time component.
 *
 * @param baseTime - The calculated base date (start of day).
 * @param timePart - The string segment containing the time info (e.g., "3pm", "10:00").
 * @param originalContext - The original normalized string for context detection (AM/PM modifiers).
 * @returns The resolved instant.
 */
const processSemanticKeyword = (baseTime: Temporal.ZonedDateTime, timePart: string, originalContext: string): Temporal.Instant => {
    if (!timePart) {
        return baseTime.toInstant();
    }

    const isPM = REGEX_IS_PM.test(originalContext);
    const isAM = REGEX_IS_AM.test(originalContext);

    // Normalize formats like "3pm" to "3 pm" to separate digits from text
    const fixTimePart = timePart.replace(REGEX_STICKY_AMPM, '$1 $2m');

    // Attempt 1: Parse as a duration (e.g., "8点" -> 8 hours from start of day)
    let addedMillis = parseDuration(fixTimePart).total({ unit: 'milliseconds', relativeTo: baseTime });

    // Attempt 2: Handle cases where duration regex fails (e.g., "3 pm" doesn't match standard units)
    const stickyMatch = REGEX_STICKY_AMPM.exec(timePart);
    if (addedMillis === 0 && stickyMatch) {
        addedMillis = Number(stickyMatch[1]) * MILLIS_IN_AN_HOUR;
    }

    if (addedMillis > 0) {
        const hours = addedMillis / MILLIS_IN_AN_HOUR;
        // Adjust for 12-hour clock context
        if (isPM && hours < 12) {
            addedMillis += 12 * MILLIS_IN_AN_HOUR;
        } else if (isAM && hours === 12) {
            addedMillis -= 12 * MILLIS_IN_AN_HOUR;
        }
        return baseTime.add({ milliseconds: addedMillis }).toInstant();
    }

    // Attempt 3: Parse as a standard time string
    for (const format of TIME_FORMATS) {
        const time = parseLenient(fixTimePart, format);
        const tried = time && fieldsToInstant({ ...time, year: baseTime.year, month: baseTime.month, day: baseTime.day }, baseTime.timeZoneId);
        if (tried) {
            // Manual adjustment if the parser missed 12-hour context (e.g., "下午" stripped earlier)
            return isPM && time.hour! < 12 ? tried.add({ hours: 12 }) : tried;
        }
    }

    return baseTime.toInstant();
};

/**
 * Parses a relative or semantic date string to an instant.
 *
 * This function handles a variety of natural language date formats, including:
 *
 * 1. **Immediate Time**:
 *    - `Just now`, `刚刚`
 *
 * 2. **Relative Durations**:
 *    - Past: `10 minutes ago`, `an hour ago`, `x days ago`, `几分钟前`
 *    - Future: `in 10 minutes`, `2 hours later`, `10分钟后`
 *
 * 3. **Semantic Keywords**:
 *    - `Today`, `Yesterday`, `Tomorrow`, `TDA`, `今天`, `昨天`, `明天`
 *    - `Monday`, `Tuesday`... (Always resolves to the previous occurrence if ambiguous)
 *    - `周一`, `星期三`, `前天`
 *
 * 4. **Combined Semantic Expressions** (Date + Time + Context):
 *    - Explicit Time: `Yesterday 10:00`, `Monday 3pm`
 *    - Contextual Modifiers: `Today 3pm`, `昨晚8点` (Yesterday Evening), `明早8点` (Tomorrow Morning)
 *    - Mixed Formats: `周五下午3点`, `Today 3 p.m.`
 *
 * 5. **Fallback**:
 *    - Any format not matched above is passed to `parseDate` with the provided options.
 *
 * @param date - The relative or absolute date string to parse.
 * @param format - The format or formats for fallback parsing. A number in this position is the time zone offset.
 * @param timeZone - The zone where the days of the semantic keywords start and end, and the zone of the fallback: an offset in hours or an IANA id. Default: UTC.
 * @returns The instant, or `undefined` when the input does not parse.
 */
export function parseRelativeDate(date: string, timeZone: number): Temporal.Instant | undefined;
export function parseRelativeDate(date: string, format?: string | string[], timeZone?: TimeZone): Temporal.Instant | undefined;
export function parseRelativeDate(date: string, format?: string | string[] | number, timeZone?: TimeZone): Temporal.Instant | undefined {
    if (!date) {
        return undefined;
    }
    if (typeof format === 'number') {
        return parseRelativeDate(date, undefined, format);
    }
    if (typeof date !== 'string') {
        return parseDate(date, format, timeZone);
    }
    if (date.length > MAX_DATE_LENGTH) {
        return undefined;
    }

    const normalized = normalize(date);
    const today = now(timeZone);

    // Strategy 1: Immediate Time
    if (normalized === 'just now') {
        return today.subtract({ seconds: 3 }).toInstant();
    }

    // Strategy 2: Relative Duration
    const agoMatch = REGEX_AGO.exec(normalized);
    if (agoMatch) {
        const duration = parseDuration(agoMatch[1]);
        if (!duration.blank) {
            return today.subtract(duration).toInstant();
        }
    }

    const inMatch = REGEX_IN.exec(normalized);
    if (inMatch) {
        const duration = parseDuration(inMatch[1] || inMatch[2]);
        if (!duration.blank) {
            return today.add(duration).toInstant();
        }
    }

    // Strategy 3: Semantic Keywords extraction and processing
    const cleanStr = normalized.replaceAll(/\s+/g, '');
    for (const word of KEYWORDS) {
        const match = word.regExp.exec(cleanStr);
        if (match) {
            const baseTime = today.startOfDay().add({ days: word.calc(today) });
            const timePart = cleanStr.replace(word.regExp, '');
            return processSemanticKeyword(baseTime, timePart, normalized);
        }
    }

    // Strategy 4: Fallback to standard parsing
    return parseDate(date, format, timeZone);
}
