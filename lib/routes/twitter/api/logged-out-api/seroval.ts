/**
 * A strict reader for the JavaScript that seroval writes into the pages x.com renders for logged-out visitors.
 *
 * x.com streams the data of a page to the browser as calls such as
 * `($R=>$R[21].next($R[26]={kind:1,requestId:2,key:"…",result:$R[27]={kind:"Result.Ok",value:…}}))($R["tsr"])`.
 * This reader decodes the argument of `.next(…)`: object and array literals with bare or quoted keys, strings with
 * JavaScript escapes, numbers, `!0`/`!1`, `true`/`false`/`null`, `void 0`/`undefined`, `$R[n]=` labels and `$R[n]`
 * references to labelled values. Anything else, such as a function or a `new` expression, makes it throw, so nothing
 * from the page is ever evaluated.
 */

const MAX_DEPTH = 256;

const LABEL = /\$R\[(\d+)\]=/y;
const REFERENCE = /\$R\[(\d+)\]/y;
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/iy;
const KEY = /[a-z_$][\w$]*|\d+/iy;
const HEX = /^[\da-f]+$/i;

interface SerovalObject {
    [key: string]: SerovalValue;
}

export type SerovalValue = string | number | boolean | null | undefined | SerovalValue[] | SerovalObject;

const WORDS: Array<[string, SerovalValue]> = [
    ['!0', true],
    ['!1', false],
    ['true', true],
    ['false', false],
    ['null', null],
    ['void 0', undefined],
    ['undefined', undefined],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
];

const ESCAPES = new Map([
    ['n', '\n'],
    ['r', '\r'],
    ['t', '\t'],
    ['b', '\b'],
    ['f', '\f'],
    ['v', '\v'],
    ['0', '\0'],
]);

/** Number of hex digits after `\x` and `\u` */
const HEX_ESCAPES = new Map([
    ['x', 2],
    ['u', 4],
]);

class SerovalReader {
    private readonly source: string;
    private position: number;
    private depth = 0;
    private readonly references = new Map<number, SerovalValue>();

    constructor(source: string, position: number) {
        this.source = source;
        this.position = position;
    }

    private value(): SerovalValue {
        this.skipSpace();
        const label = this.match(LABEL);
        if (label) {
            const value = this.value();
            this.references.set(Number(label[1]), value);
            return value;
        }
        switch (this.source[this.position]) {
            case '{':
                return this.nested(() => this.object());
            case '[':
                return this.nested(() => this.array());
            case '"':
                return this.string();
            default:
                break;
        }
        const number = this.match(NUMBER);
        if (number) {
            return Number(number[0]);
        }
        for (const [word, value] of WORDS) {
            if (this.source.startsWith(word, this.position)) {
                this.position += word.length;
                return value;
            }
        }
        const reference = this.match(REFERENCE);
        if (reference) {
            return this.references.get(Number(reference[1]));
        }
        throw this.error('Unexpected input');
    }

    private object() {
        this.position++;
        const object: SerovalObject = {};
        this.skipSpace();
        if (this.source[this.position] === '}') {
            this.position++;
            return object;
        }
        for (;;) {
            this.skipSpace();
            let key: string;
            if (this.source[this.position] === '"') {
                key = this.string();
            } else {
                const name = this.match(KEY);
                if (!name) {
                    throw this.error('Bad key');
                }
                key = name[0];
            }
            this.skipSpace();
            if (this.source[this.position] !== ':') {
                throw this.error('Expected ":"');
            }
            this.position++;
            const value = this.value();
            if (key === '__proto__') {
                // An own property, not the prototype
                Object.defineProperty(object, key, { value, enumerable: true, writable: true, configurable: true });
            } else {
                object[key] = value;
            }
            this.skipSpace();
            const char = this.source[this.position++];
            if (char === '}') {
                return object;
            }
            if (char !== ',') {
                throw this.error('Expected "," or "}"');
            }
        }
    }

    private array() {
        this.position++;
        const array: SerovalValue[] = [];
        for (;;) {
            this.skipSpace();
            const next = this.source[this.position];
            if (next === ']') {
                this.position++;
                return array;
            }
            // A comma right away is a hole in a sparse array
            array.push(next === ',' ? undefined : this.value());
            this.skipSpace();
            const char = this.source[this.position++];
            if (char === ']') {
                return array;
            }
            if (char !== ',') {
                throw this.error('Expected "," or "]"');
            }
        }
    }

    private string() {
        let result = '';
        let start = ++this.position;
        for (;;) {
            const char = this.source[this.position];
            if (char === undefined) {
                throw this.error('Unterminated string');
            }
            if (char === '"') {
                result += this.source.slice(start, this.position++);
                return result;
            }
            if (char !== '\\') {
                this.position++;
                continue;
            }
            result += this.source.slice(start, this.position);
            const escape = this.source[this.position + 1];
            this.position += 2;
            if (escape === undefined) {
                throw this.error('Unterminated string');
            }
            const hexLength = HEX_ESCAPES.get(escape);
            // \" \\ \/ \' and other escapes without a meaning of their own stand for the character itself
            result += hexLength ? this.hex(hexLength) : (ESCAPES.get(escape) ?? escape);
            start = this.position;
        }
    }

    private hex(length: number) {
        const digits = this.source.slice(this.position, this.position + length);
        if (digits.length !== length || !HEX.test(digits)) {
            throw this.error('Bad escape');
        }
        this.position += length;
        // A \u escape is a UTF-16 unit: surrogate pairs come as two escapes and join up in the string
        return String.fromCodePoint(Number.parseInt(digits, 16));
    }

    private nested<T>(read: () => T): T {
        if (++this.depth > MAX_DEPTH) {
            throw this.error('Too deeply nested');
        }
        const value = read();
        this.depth--;
        return value;
    }

    private match(pattern: RegExp) {
        pattern.lastIndex = this.position;
        const match = pattern.exec(this.source);
        if (match) {
            this.position = pattern.lastIndex;
        }
        return match;
    }

    private skipSpace() {
        while (' \t\r\n'.includes(this.source[this.position] || 'x')) {
            this.position++;
        }
    }

    private error(message: string) {
        return new SyntaxError(`${message} at position ${this.position} of a seroval literal`);
    }

    read() {
        return this.value();
    }
}

/** Decodes the seroval literal that starts at `position` in `source` */
export const readSeroval = (source: string, position = 0): SerovalValue => new SerovalReader(source, position).read();
