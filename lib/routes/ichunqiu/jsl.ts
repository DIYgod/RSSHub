import { hash } from 'node:crypto';

import { generateHeaders } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';

type Value = number | string | boolean | Value[] | Record<string, never>;

const isEmptyObject = (v: number | string | boolean | Record<string, never>): v is Record<string, never> => typeof v === 'object';

const isString = (v: number | string | boolean): v is string => typeof v === 'string';

const toPrimitive = (v: Value): number | string | boolean => (Array.isArray(v) ? v.join(',') : isEmptyObject(v) ? '[object Object]' : v);

// precedence: | < ^ < & < shifts < additive < multiplicative
const binaryPrecedence = { '|': 1, '^': 2, '&': 3, '<<': 4, '>>': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 } as const;

type BinaryOperator = keyof typeof binaryPrecedence;

const isBinaryOperator = (op: string): op is BinaryOperator => Object.hasOwn(binaryPrecedence, op);

const evaluateJsl = (source: string): string => {
    let pos = 0;
    const skipSpaces = () => {
        while (source[pos] === ' ') {
            pos++;
        }
    };
    const expect = (char: string) => {
        skipSpaces();
        if (source[pos++] !== char) {
            throw new Error(`Expected ${char} at ${pos - 1} in JSL expression`);
        }
    };

    const primary = (): Value => {
        skipSpaces();
        const char = source[pos];
        if (char === '(') {
            pos++;
            const value = expression(0);
            expect(')');
            return value;
        }
        if (char === "'") {
            const end = source.indexOf("'", pos + 1);
            if (end === -1) {
                throw new Error(`Unterminated string at ${pos} in JSL expression`);
            }
            const value = source.slice(pos + 1, end);
            pos = end + 1;
            return value;
        }
        if (char === '[') {
            pos++;
            skipSpaces();
            if (source[pos] === ']') {
                pos++;
                return [];
            }
            const value = expression(0);
            expect(']');
            return [value];
        }
        if (char === '{') {
            pos++;
            expect('}');
            return {};
        }
        if (source.startsWith('true', pos)) {
            pos += 4;
            return true;
        }
        if (source.startsWith('false', pos)) {
            pos += 5;
            return false;
        }
        const digits = /^\d+/.exec(source.slice(pos));
        if (digits) {
            pos += digits[0].length;
            return Number(digits[0]);
        }
        throw new Error(`Unexpected ${JSON.stringify(char)} at ${pos} in JSL expression`);
    };

    const unary = (): Value => {
        skipSpaces();
        const op = source[pos];
        if (op !== undefined && '-+~!'.includes(op)) {
            pos++;
            const value = unary();
            switch (op) {
                case '-':
                    return -Number(toPrimitive(value));
                case '+':
                    return Number(toPrimitive(value));
                case '~':
                    return ~Number(toPrimitive(value));
                default:
                    return !value;
            }
        }
        return primary();
    };

    const readBinaryOperator = (): BinaryOperator | undefined => {
        skipSpaces();
        const two = source.slice(pos, pos + 2);
        if (two === '<<' || two === '>>') {
            return two;
        }
        const one = source[pos];
        return one && isBinaryOperator(one) ? one : undefined;
    };

    const applyBinary = (op: string, left: Value, right: Value): Value => {
        const a = toPrimitive(left);
        const b = toPrimitive(right);
        if (op === '+') {
            return isString(a) || isString(b) ? `${a}${b}` : Number(a) + Number(b);
        }
        const x = Number(a);
        const y = Number(b);
        switch (op) {
            case '-':
                return x - y;
            case '*':
                return x * y;
            case '/':
                return x / y;
            case '%':
                return x % y;
            case '<<':
                return x << y;
            case '>>':
                return x >> y;
            case '&':
                return x & y;
            case '^':
                return x ^ y;
            default:
                return x | y;
        }
    };

    const expression = (minPrecedence: number): Value => {
        let left = unary();
        let op = readBinaryOperator();
        while (op && binaryPrecedence[op] >= minPrecedence) {
            pos += op.length;
            left = applyBinary(op, left, expression(binaryPrecedence[op] + 1));
            op = readBinaryOperator();
        }
        return left;
    };

    const result = expression(0);
    skipSpaces();
    if (pos !== source.length) {
        throw new Error(`Unexpected trailing input at ${pos} in JSL expression`);
    }
    return String(toPrimitive(result));
};

const solveJsl = ({ bts, chars, ct, ha }) => {
    for (const a of chars) {
        for (const b of chars) {
            const answer = bts[0] + a + b + bts[1];
            if (hash(ha, answer) === ct) {
                return answer;
            }
        }
    }
    throw new Error('Failed to solve __jsl_clearance_s');
};

export const createJslFetch = () => {
    const cookies = new Map<string, string>();
    const headers = generateHeaders();
    const fetchPage = async (url: string) => {
        const response = await ofetch.raw<string, 'text'>(url, {
            headers: {
                ...headers,
                cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
            },
            ignoreResponseError: true,
            responseType: 'text',
        });
        for (const cookie of response.headers.getSetCookie()) {
            const [name, value] = cookie.split(';', 1)[0].split('=', 2);
            cookies.set(name, value);
        }
        return response._data!;
    };

    return async (url: string) => {
        // obtain __jsluid_s from set-cookie header
        let body = await fetchPage(url);
        for (let round = 0; round < 5; round++) {
            const assignment = body.match(/document\.cookie=(.+?);location\.href/s);
            const challenge = body.match(/go\((\{.+?\})\)/s);
            if (assignment) {
                // get 1st __jsl_clearance_s
                const [name, value] = evaluateJsl(assignment[1]).split(';', 1)[0].split('=', 2);
                cookies.set(name, value);
            } else if (challenge) {
                // get 2nd __jsl_clearance_s
                const puzzle = JSON.parse(challenge[1]);
                cookies.set(puzzle.tn, solveJsl(puzzle));
            } else {
                break;
            }
            // oxlint-disable-next-line no-await-in-loop
            body = await fetchPage(url);
        }
        return body;
    };
};
