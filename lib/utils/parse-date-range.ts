import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

/** The parsed result of a date range string, with each date in 'YYYY-MM-DD' format. */
export interface DateRange {
    /** The start date, or undefined if not found or not applicable. */
    startDate?: string;
    /** The end date, or undefined if not found or not applicable. */
    endDate?: string;
}

/**
 * Controls how a 2-segment partial date (e.g. "06.05") is interpreted
 * when the string contains no month name or year to resolve the ambiguity.
 *
 * - `'MDY'` (default): first number is the **month**, second is the **day** — typical in US English.
 *   Example: `"06.05"` → June 5
 * - `'DMY'`: first number is the **day**, second is the **month** — typical in European contexts.
 *   Example: `"06.05"` → May 6
 *
 * This has no effect when the date includes a month name or a 4-digit year,
 * since those formats are unambiguous.
 */
export type DateOrder = 'MDY' | 'DMY';

// ============================================================
// Constants
// ============================================================

const EN_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Long names first so they are matched before their short prefix (e.g. "January" before "Jan")
// oxlint-disable regexp/no-dupe-disjunctions
const EN_MONTHS_PATTERN = `(?:${[...EN_MONTHS_LONG, ...EN_MONTHS_SHORT].join('|')})\\.?`;

/** Chinese characters that signal the date marks when an exhibition **closes** */
const CN_END_KEYWORDS = ['闭展', '撤展', '闭幕', '结束'];

/** English words (matched whole-word) that signal the date is a closing/end date */
const EN_END_KEYWORDS = ['closed', 'closes', 'closing', 'until', 'through', 'thru', 'ends', 'end'];

// ============================================================
// Internal helpers
// ============================================================

/** Maps common Chinese number characters to their numeric values. */
const CN_NUM_MAP: Record<string, number> = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
};

/**
 * Tries to extract an **exact day count** from a duration suffix in the input text.
 *
 * Only day-precise durations are returned. Week, month, and year durations are
 * considered approximate in exhibition contexts and are intentionally ignored.
 *
 * Recognised patterns:
 * - Chinese days:  `展期90天`, `展期两天`
 * - English days:  `for 90 days`, `lasting 30 days`, `runs for 14 days`
 *
 * @param text  The sanitised date range string to scan.
 * @returns The number of days if a day-precise duration is found, otherwise `undefined`.
 */
const parseExactDays = (text: string): number | undefined => {
    // Chinese days: 展期[约/大概/共] N [个]? [天|日]
    const cnMatch = text.match(/展期[约大概共]*(\d+|[一二三四五六七八九十两]+)个?[天日](?!期)/);
    if (cnMatch) {
        const rawNum = cnMatch[1];
        const value = /^\d+$/.test(rawNum) ? Number(rawNum) : (CN_NUM_MAP[rawNum] ?? 0);
        if (value > 0) {
            return value;
        }
    }

    // English days: for 90 days / lasting 30 days / runs for 14 days
    const enMatch = text.match(/(?:for|runs?\s+for|lasting?)\s+(\d+)\s*days?/i);
    if (enMatch) {
        const value = Number(enMatch[1]);
        if (value > 0) {
            return value;
        }
    }

    return undefined;
};

/**
 * Returns true if `text` contains any of the given `keywords`.
 *
 * @param text        The string to search within.
 * @param keywords    The list of keywords to look for.
 * @param wholeWord   If true, each keyword must match as a whole word (case-insensitive, English only).
 *                    If false, a plain substring match is used (suitable for Chinese).
 */
const containsKeyword = (text: string, keywords: string[], wholeWord = false): boolean => {
    if (wholeWord) {
        return keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(text));
    }
    return keywords.some((keyword) => text.includes(keyword));
};

/**
 * Tries to parse a single English month-name date fragment into 'YYYY-MM-DD'.
 *
 * Recognised layouts (month name can be abbreviated or full, ordinal suffixes are optional):
 * - MDY with year:    "Jan 1, 2025",  "January 1st 2025"
 * - DMY with year:    "1 Jan 2025",   "1st January 2025"
 * - MDY without year: "Jan 1",        "January 1st"        (requires `yearHint`)
 * - DMY without year: "1 Jan",        "1st January"        (requires `yearHint`)
 *
 * @param raw       The date fragment to parse (already trimmed).
 * @param yearHint  Year to substitute when the fragment itself contains no year.
 * @returns Formatted date string in 'YYYY-MM-DD', or undefined if unrecognised.
 */
const parseEnglishMonthDate = (raw: string, yearHint?: number): string | undefined => {
    // MDY full: "Jan 1, 2025" / "January 1st 2025"
    const mdyFull = raw.match(new RegExp(`^(${EN_MONTHS_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?[ ,]+(\\d{4})$`, 'i'));
    if (mdyFull) {
        const d = dayjs(`${mdyFull[1].replace('.', '')} ${mdyFull[2]} ${mdyFull[3]}`, ['MMMM D YYYY', 'MMM D YYYY']);
        if (d.isValid()) {
            return d.format('YYYY-MM-DD');
        }
    }

    // MDY partial: "Jan 1" / "January 1st" (needs yearHint)
    const mdyPartial = raw.match(new RegExp(`^(${EN_MONTHS_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?$`, 'i'));
    if (mdyPartial && yearHint) {
        const d = dayjs(`${mdyPartial[1].replace('.', '')} ${mdyPartial[2]} ${yearHint}`, ['MMMM D YYYY', 'MMM D YYYY']);
        if (d.isValid()) {
            return d.format('YYYY-MM-DD');
        }
    }

    // DMY full: "1 Jan 2025" / "1st January 2025"
    const dmyFull = raw.match(new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?\\s+(${EN_MONTHS_PATTERN})\\s+(\\d{4})$`, 'i'));
    if (dmyFull) {
        const d = dayjs(`${dmyFull[2].replace('.', '')} ${dmyFull[1]} ${dmyFull[3]}`, ['MMMM D YYYY', 'MMM D YYYY']);
        if (d.isValid()) {
            return d.format('YYYY-MM-DD');
        }
    }

    // DMY partial: "1 Jan" / "1st January" (needs yearHint)
    const dmyPartial = raw.match(new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?\\s+(${EN_MONTHS_PATTERN})$`, 'i'));
    if (dmyPartial && yearHint) {
        const d = dayjs(`${dmyPartial[2].replace('.', '')} ${dmyPartial[1]} ${yearHint}`, ['MMMM D YYYY', 'MMM D YYYY']);
        if (d.isValid()) {
            return d.format('YYYY-MM-DD');
        }
    }

    return undefined;
};

/**
 * Converts a single raw date fragment into a 'YYYY-MM-DD' string.
 *
 * Recognised formats, tried in this order:
 * 1. Chinese full:    "2025年1月1日", "25年1月1日"
 * 2. Chinese partial: "6月30日"          (requires `yearHint`)
 * 3. English month name: "Jan 1, 2025", "1 Jan 2025", "Jan 1" (requires `yearHint` for partial)
 * 4. Numeric full:   "2025.01.01", "25.01.01"
 * 5. Numeric partial: "05.10", "5/10"   (requires `yearHint`; `fieldOrder` controls MM/DD vs DD/MM)
 * 6. Day-only partial: "10", "10日"   (requires `yearHint` and `monthHint`)
 *
 * @param raw         The raw date fragment to normalise (may have surrounding whitespace).
 * @param yearHint    Year to substitute when the fragment contains no year component.
 * @param fieldOrder  How to resolve ambiguous 2-segment numeric dates (default `'MDY'`).
 * @returns Formatted date in 'YYYY-MM-DD', or undefined if the input cannot be parsed.
 */
const normalizeDate = (raw: string | undefined, yearHint?: number, monthHint?: number, fieldOrder: DateOrder = 'MDY'): string | undefined => {
    if (!raw) {
        return undefined;
    }
    const trimmed = raw.trim();

    // 1. Chinese full: "2025年1月1日" or "25年1月1日"
    const cnFull = trimmed.match(/^(\d{2,4})年(\d{1,2})月(\d{1,2})日?$/);
    if (cnFull) {
        const rawYear = cnFull[1];
        const year = (rawYear.length === 2 ? 2000 : 0) + Number(rawYear);
        const d = dayjs(`${year}-${cnFull[2]}-${cnFull[3]}`);
        return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
    }

    // 2. Chinese partial: "6月30日" (year inferred from start date)
    const cnPartial = trimmed.match(/^(\d{1,2})月(\d{1,2})日?$/);
    if (cnPartial && yearHint) {
        const d = dayjs(`${yearHint}-${cnPartial[1]}-${cnPartial[2]}`);
        return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
    }

    // 3. English month-name formats (both MDY and DMY)
    const enResult = parseEnglishMonthDate(trimmed, yearHint);
    if (enResult) {
        return enResult;
    }

    // 4. Numeric full (4-digit year): "2025.01.01", "2025/01/01", "2025-01-01"
    const numFull = trimmed.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
    if (numFull) {
        const d = dayjs(`${numFull[1]}-${numFull[2]}-${numFull[3]}`);
        return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
    }

    // 4a. Numeric with 2-digit year: "26.10.01" (assumes YY-MM-DD)
    const numTwoDigitYear = trimmed.match(/^(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
    if (numTwoDigitYear) {
        // Day.js handles 2-digit year parsing (e.g., 70-99 -> 19xx, 00-69 -> 20xx)
        const d = dayjs(`${numTwoDigitYear[1]}-${numTwoDigitYear[2]}-${numTwoDigitYear[3]}`, 'YY-MM-DD');
        return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
    }

    // 5. Numeric partial (no year): "05.10", "5/10", "5-10"
    //    fieldOrder determines whether the first number is the month (MDY) or the day (DMY)
    const numPartial = trimmed.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
    if (numPartial && yearHint) {
        const first = Number(numPartial[1]);
        const second = Number(numPartial[2]);
        const [month, day] = fieldOrder === 'DMY' ? [second, first] : [first, second];
        const d = dayjs(`${yearHint}-${month}-${day}`);
        return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
    }

    // 6. Day-only partial (no year, no month): "16", "16日", "5"
    const dayOnly = trimmed.match(/^(\d{1,2})日?$/);
    if (dayOnly && yearHint && monthHint) {
        const d = dayjs(`${yearHint}-${monthHint}-${dayOnly[1]}`);
        return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
    }

    return undefined;
};

// ============================================================
// Date token extractor
// ============================================================

/**
 * Ordered list of regex patterns for extracting date fragments.
 * More specific (longer) patterns appear first so they are matched and
 * "claimed" before a shorter sub-pattern can grab the same characters.
 */
const DATE_TOKEN_PATTERNS: RegExp[] = [
    // Chinese full: "2025年1月1日" / "25年1月1日"
    /\d{2,4}年\d{1,2}月\d{1,2}日?/g,
    // Chinese partial: "6月30日" / "6月30"
    /\d{1,2}月\d{1,2}日?/g,
    // English MDY full: "Jan 1, 2025" / "January 1st 2025"
    new RegExp(`${EN_MONTHS_PATTERN}\\s+\\d{1,2}(?:st|nd|rd|th)?[ ,]+\\d{4}`, 'gi'),
    // English DMY full: "1 Jan 2025" / "1st January 2025"
    new RegExp(`\\d{1,2}(?:st|nd|rd|th)?\\s+${EN_MONTHS_PATTERN}\\s+\\d{4}`, 'gi'),
    // English MDY partial (no year): "Jan 1" / "January 1st"
    new RegExp(`${EN_MONTHS_PATTERN}\\s+\\d{1,2}(?:st|nd|rd|th)?(?!\\s*\\d)`, 'gi'),
    // English DMY partial (no year): "1 Jan" / "1st January"
    new RegExp(`\\d{1,2}(?:st|nd|rd|th)?\\s+${EN_MONTHS_PATTERN}(?!\\s*\\d)`, 'gi'),
    // Numeric full: "2025.01.01" / "25.01.01" / "2025-01-01"
    /\d{2,4}[.\-/]\d{1,2}[.\-/]\d{1,2}/g,
    // Numeric partial (no year, 2-segment): "05.10" / "5/10"
    // Non-digit boundaries prevent matching inside a 3-segment numeric date
    /(?<!\d)\d{1,2}[.\-/]\d{1,2}(?!\d)/g,
    // Day-only partial (no year, no month): "16日", or "16" when not adjacent to other digits.
    // The negative lookbehind for a separator is a fallback for ambiguous cases like `...-5`.
    /(?<!\d)\d{1,2}日(?!\d)|(?<=[-~—–～至到/]\s*)\d{1,2}(?!\d)/g,
];

/**
 * Scans `text` for date-like substrings and returns them in document order.
 *
 * Each character position can only be claimed by one pattern — longer/higher-priority
 * patterns win, so "2025.01.01" is returned as one token rather than letting the
 * 2-segment pattern grab ".01" as a separate token.
 *
 * @param text  The sanitised input string to scan.
 * @returns Array of raw date fragments in the order they appear.
 */
const extractDateTokens = (text: string): string[] => {
    const claimed = Array.from({ length: text.length }, () => false);
    const matches: Array<{ index: number; text: string }> = [];

    for (const pattern of DATE_TOKEN_PATTERNS) {
        const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
        let match: RegExpExecArray | null;
        // eslint-disable-next-line no-cond-assign
        while ((match = re.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            // Skip overlapping matches — earlier (higher-priority) patterns already claimed these chars
            if (claimed.slice(start, end).some(Boolean)) {
                continue;
            }
            for (let i = start; i < end; i++) {
                claimed[i] = true;
            }
            matches.push({ index: start, text: match[0].trim() });
        }
    }

    // Sort matches by their appearance order in the input text
    matches.sort((a, b) => a.index - b.index);
    return matches.map((m) => m.text);
};

// ============================================================
// Main export
// ============================================================

/**
 * Parses a free-form date range string into structured start and end dates.
 *
 * Both dates are returned in `'YYYY-MM-DD'` format. Either value may be `undefined`
 * if the input contains only one date or the string cannot be parsed.
 *
 * ---
 *
 * **Supported formats**
 *
 * *Chinese*
 * | Input | Result |
 * |---|---|
 * | `"2025年1月1日 - 2025年6月30日"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 * | `"2025年1月1日至6月30日"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 * | `"2024.11.01 - 02.15"` | `{ startDate: '2024-11-01', endDate: '2025-02-15' }` (cross-year) |
 * | `"2025年2月16日闭展"` | `{ startDate: undefined, endDate: '2025-02-16' }` |
 *
 * *English*
 * | Input | Result |
 * |---|---|
 * | `"Jan 1, 2025 – Jun 30, 2025"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 * | `"January 1 to June 30, 2025"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 * | `"1 Jan 2025 – 30 Jun 2025"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 * | `"Closed Jan 5, 2025"` | `{ startDate: undefined, endDate: '2025-01-05' }` |
 *
 * *Numeric*
 * | Input | Result |
 * |---|---|
 * | `"2025-01-01 to 2025-06-30"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 * | `"2025.01.01 ~ 2025.06.30"` | `{ startDate: '2025-01-01', endDate: '2025-06-30' }` |
 *
 * ---
 *
 * @param rangeStr    The raw date range string to parse. Returns empty result if falsy.
 * @param fieldOrder  How to interpret short numeric dates that have no year or month name,
 *                    e.g. `"06.05"`. Pass `'MDY'` (default) to read it as month-first (June 5),
 *                    or `'DMY'` to read it as day-first (May 6). Has no effect when the date
 *                    format is already unambiguous (e.g. contains a month name or full year).
 * @returns `DateRange` with optional `startDate` and `endDate` in `'YYYY-MM-DD'` format.
 */
export const parseDateRange = (rangeStr?: string, fieldOrder: DateOrder = 'MDY'): DateRange => {
    if (!rangeStr) {
        return { startDate: undefined, endDate: undefined };
    }

    // Remove parenthesised side-notes (e.g. "(逢周一闭馆)", "(closed Mondays)") before scanning
    const sanitized = rangeStr.replaceAll(/（[^）]*）|\([^)]*\)/g, '').trim();

    // Detect whether the surrounding text hints that the date is a closing or opening date
    const isClosingDate = containsKeyword(sanitized, CN_END_KEYWORDS) || containsKeyword(sanitized, EN_END_KEYWORDS, true);

    const tokens = extractDateTokens(sanitized);

    if (tokens.length === 0) {
        return { startDate: undefined, endDate: undefined };
    }

    if (tokens.length === 1) {
        const date = normalizeDate(tokens[0], undefined, undefined, fieldOrder);

        if (isClosingDate) {
            // An explicit closing keyword signals this is the end date.
            return { startDate: undefined, endDate: date };
        }

        // A day-precise duration (e.g. '展期90天', 'for 30 days') is exact enough
        // to calculate the closing date. Week/month durations are approximate and
        // are ignored — the museum will publish the actual closing date separately.
        const exactDays = parseExactDays(sanitized);
        if (date && exactDays !== undefined) {
            const endDate = dayjs(date).add(exactDays, 'day').format('YYYY-MM-DD');
            return { startDate: date, endDate };
        }

        // In exhibition contexts, a single date without a closing keyword is
        // almost always the opening date. Treat it as startDate.
        return { startDate: date, endDate: undefined };
    }

    // Two or more tokens → interpret as start–end range
    const startToken = tokens[0];
    const endToken = tokens[1];

    // Find 4-digit year from startToken, endToken, or sanitized text (e.g., 'Jan 15–20, 2025')
    const startYearMatch = startToken.match(/\b(\d{4})\b/);
    const endYearMatch = endToken.match(/\b(\d{4})\b/);
    const textYearMatch = sanitized.match(/\b(\d{4})\b/);

    const yearHint = startYearMatch ? Number(startYearMatch[1]) : endYearMatch ? Number(endYearMatch[1]) : textYearMatch ? Number(textYearMatch[1]) : undefined;

    const startHasYear = Boolean(startYearMatch);
    // A year is present if it's a 4-digit number, or a 2-digit number at the start of a 3-part numeric date.
    const endHasYear = Boolean(endYearMatch) || /^\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}$/.test(endToken);

    const startDate = normalizeDate(startToken, yearHint, undefined, fieldOrder);

    // A month is present if it includes a Chinese/English month name, or is a multi-part numeric date.
    const endTokenHasMonth = new RegExp(
        [
            '月', // Chinese month character
            String.raw`\d+[.\-/]\d+`, // Numeric date with separator (e.g., "10.01", "26.10.01")
            EN_MONTHS_PATTERN, // English month name (full or short)
        ].join('|'),
        'i'
    ).test(endToken);
    const inferredEndMonth = !endTokenHasMonth && startDate ? dayjs(startDate).month() + 1 : undefined;

    const endDate = normalizeDate(endToken, yearHint, inferredEndMonth, fieldOrder);

    // Cross-date guard: if the inferred end date falls before the start date, bump month or year
    if (startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate))) {
        if (!endTokenHasMonth && inferredEndMonth !== undefined) {
            const nextMonth = dayjs(startDate).add(1, 'month');
            const crossMonthEnd = normalizeDate(endToken, nextMonth.year(), nextMonth.month() + 1, fieldOrder);
            return { startDate, endDate: crossMonthEnd };
        }
        if (!startHasYear && endHasYear && yearHint !== undefined) {
            // Reverse year inheritance: start date was in the previous year (e.g. Dec 20 to Jan 15, 2025)
            const crossYearStart = normalizeDate(startToken, yearHint - 1, undefined, fieldOrder);
            return { startDate: crossYearStart, endDate };
        }
        if (!endHasYear && yearHint !== undefined) {
            // Forward year inheritance: end date is in the next year (e.g. Nov 01 to Feb 15)
            const crossYearEnd = normalizeDate(endToken, yearHint + 1, undefined, fieldOrder);
            return { startDate, endDate: crossYearEnd };
        }
    }

    return { startDate, endDate };
};
