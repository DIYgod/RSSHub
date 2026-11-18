import type { DateFields } from './fields';

// The format tokens are the dayjs `customParseFormat` tokens, so route formats written for dayjs stay valid.

interface Draft extends DateFields {
    afternoon?: boolean;
}

/** Returns `false` when the matched text is not a value of the token. */
type Setter = (draft: Draft, value: string) => boolean | void;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3));
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DIGIT = /\d/;
const DIGITS_2 = /\d\d/;
const DIGITS_1_TO_2 = /\d\d?/;
const OFFSET = /[+-]\d\d:?(\d\d)?|Z/;
const WORD = /\d*[^-_:/,()\s\d]+/;

const number =
    (key: Exclude<keyof DateFields, 'offsetMinutes'>, scale = 1): Setter =>
    (draft, value) => {
        draft[key] = Number(value) * scale;
    };

const name =
    (names: string[]): Setter =>
    (draft, value) => {
        draft.month = names.indexOf(value) + 1;
        return draft.month > 0;
    };

const meridiem =
    (afternoon: string): Setter =>
    (draft, value) => {
        draft.afternoon = value === afternoon;
    };

const offset: Setter = (draft, value) => {
    const [, sign, hours, minutes] = /([+-])(\d\d):?(\d\d)?/.exec(value) ?? [];
    draft.offsetMinutes = sign ? (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes ?? 0)) : 0;
};

// [regex of the lenient mode, pattern of the strict mode, setter]
const TOKENS = new Map<string, [RegExp, string, Setter]>([
    ['YYYY', [/\d{4}/, String.raw`\d{4}`, number('year')]],
    [
        'YY',
        [
            DIGITS_2,
            String.raw`\d\d`,
            (draft, value) => {
                draft.year = Number(value) + (Number(value) > 68 ? 1900 : 2000);
            },
        ],
    ],
    ['M', [DIGITS_1_TO_2, '1[0-2]|[1-9]', number('month')]],
    ['MM', [DIGITS_2, '0[1-9]|1[0-2]', number('month')]],
    ['MMM', [WORD, MONTHS_SHORT.join('|'), name(MONTHS_SHORT)]],
    ['MMMM', [WORD, MONTHS.join('|'), name(MONTHS)]],
    ['D', [DIGITS_1_TO_2, String.raw`[12]\d|3[01]|[1-9]`, number('day')]],
    ['DD', [DIGITS_2, String.raw`0[1-9]|[12]\d|3[01]`, number('day')]],
    [
        'Do',
        [
            WORD,
            String.raw`(?:[12]\d|3[01]|[1-9])(?:st|nd|rd|th)`,
            (draft, value) => {
                draft.day = Number.parseInt(value);
                return !Number.isNaN(draft.day);
            },
        ],
    ],
    ['H', [DIGITS_1_TO_2, String.raw`1\d|2[0-3]|\d`, number('hour')]],
    ['HH', [DIGITS_1_TO_2, String.raw`[01]\d|2[0-3]`, number('hour')]],
    ['h', [DIGITS_1_TO_2, '1[0-2]|[1-9]', number('hour')]],
    ['hh', [DIGITS_1_TO_2, '0[1-9]|1[0-2]', number('hour')]],
    ['m', [DIGITS_1_TO_2, String.raw`[1-5]\d|\d`, number('minute')]],
    ['mm', [DIGITS_1_TO_2, String.raw`[0-5]\d`, number('minute')]],
    ['s', [DIGITS_1_TO_2, String.raw`[1-5]\d|\d`, number('second')]],
    ['ss', [DIGITS_1_TO_2, String.raw`[0-5]\d`, number('second')]],
    ['S', [DIGIT, String.raw`\d`, number('millisecond', 100)]],
    ['SS', [DIGITS_2, String.raw`\d\d`, number('millisecond', 10)]],
    ['SSS', [/\d{3}/, String.raw`\d{3}`, number('millisecond')]],
    ['A', [WORD, 'AM|PM', meridiem('PM')]],
    ['a', [WORD, 'am|pm', meridiem('pm')]],
    ['Z', [OFFSET, String.raw`[+-]\d\d:\d\d`, offset]],
    ['ZZ', [OFFSET, String.raw`[+-]\d{4}`, offset]],
]);

const finish = ({ afternoon, ...fields }: Draft): DateFields => {
    if (afternoon !== undefined && fields.hour !== undefined) {
        if (afternoon && fields.hour < 12) {
            fields.hour += 12;
        } else if (!afternoon && fields.hour === 12) {
            fields.hour = 0;
        }
    }
    return fields;
};

// === Lenient mode: the dayjs non-strict algorithm ===
// A token takes the first match in the remaining input, a separator moves the search
// start by its length without a comparison, and other characters of the format are ignored.

const LENIENT_TOKENS = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY|M{1,4}|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|ZZ?)/g;

type LenientStep = number | [RegExp, Setter];

const lenientSteps = new Map<string, LenientStep[]>();

const compileLenient = (format: string): LenientStep[] => {
    let steps = lenientSteps.get(format);
    if (!steps) {
        steps = (format.match(LENIENT_TOKENS) ?? []).map((token): LenientStep => {
            const definition = TOKENS.get(token);
            return definition ? [definition[0], definition[2]] : token.replaceAll(/^\[|\]$/g, '').length;
        });
        lenientSteps.set(format, steps);
    }
    return steps;
};

export const parseLenient = (input: string, format: string): DateFields | undefined => {
    const draft: Draft = {};
    let rest = input;
    let start = 0;
    for (const step of compileLenient(format)) {
        if (typeof step === 'number') {
            start += step;
            continue;
        }
        const match = step[0].exec(rest.slice(start));
        if (!match || step[1](draft, match[0]) === false) {
            return undefined;
        }
        rest = rest.replace(match[0], '');
    }
    return finish(draft);
};

// === Strict mode: the format must describe the full input ===

const STRICT_TOKENS = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM?|Do|DD?|HH?|hh?|mm?|ss?|S{1,3}|ZZ?|[Aa]|dddd|ddd|./gs;

const strictParsers = new Map<string, [RegExp, Setter[]]>();

const compileStrict = (format: string): [RegExp, Setter[]] => {
    let parser = strictParsers.get(format);
    if (!parser) {
        const setters: Setter[] = [];
        const source = format.replaceAll(STRICT_TOKENS, (token, literal?: string) => {
            if (literal !== undefined) {
                return RegExp.escape(literal);
            }
            if (token === 'dddd' || token === 'ddd') {
                return `(?:${WEEKDAYS.map((weekday) => (token === 'ddd' ? weekday.slice(0, 3) : weekday)).join('|')})`;
            }
            const definition = TOKENS.get(token);
            if (!definition) {
                return RegExp.escape(token);
            }
            setters.push(definition[2]);
            return `(${definition[1]})`;
        });
        parser = [new RegExp(`^${source}$`), setters];
        strictParsers.set(format, parser);
    }
    return parser;
};

export const parseStrict = (input: string, format: string): DateFields | undefined => {
    const [regex, setters] = compileStrict(format);
    const match = regex.exec(input);
    if (!match) {
        return undefined;
    }
    const draft: Draft = {};
    for (const [index, setter] of setters.entries()) {
        setter(draft, match[index + 1]);
    }
    return finish(draft);
};
