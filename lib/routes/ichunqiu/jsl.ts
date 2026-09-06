type Value = number | string | boolean | Value[] | Record<string, never>;

const toPrimitive = (v: Value): number | string | boolean => (Array.isArray(v) ? v.join(',') : typeof v === 'object' ? '[object Object]' : v);

// precedence: | < ^ < & < shifts < additive < multiplicative
const binaryPrecedence: Record<string, number> = { '|': 1, '^': 2, '&': 3, '<<': 4, '>>': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };

export const evaluateJsl = (source: string): string => {
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

    const readBinaryOperator = (): string | undefined => {
        skipSpaces();
        const two = source.slice(pos, pos + 2);
        if (two === '<<' || two === '>>') {
            return two;
        }
        const one = source[pos];
        return one && binaryPrecedence[one] === undefined ? undefined : one;
    };

    const applyBinary = (op: string, left: Value, right: Value): Value => {
        const a = toPrimitive(left);
        const b = toPrimitive(right);
        if (op === '+') {
            return typeof a === 'string' || typeof b === 'string' ? `${a}${b}` : Number(a) + Number(b);
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
