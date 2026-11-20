import zlib from 'node:zlib';

import { describe, expect, it } from 'vitest';

import shim, { inflateRawSync } from '@/shims/zlib';

const data = (size: number) => Buffer.alloc(size, 'abcdefghij');

describe('zlib shim', () => {
    // workerd's own inflateRawSync throws for these sizes
    it.each([40961, 45756, 65536, 100000])('inflates %d bytes with maxOutputLength at the inflated size', (size) => {
        const inflated = inflateRawSync(zlib.deflateRawSync(data(size)), { maxOutputLength: size });
        expect(inflated.equals(data(size))).toBe(true);
    });

    it.each([1, 65535])('throws when 65536 bytes are inflated with maxOutputLength %d', (maxOutputLength) => {
        const compressed = zlib.deflateRawSync(data(65536));
        expect(() => inflateRawSync(compressed, { maxOutputLength })).toThrow(RangeError);
    });

    it('inflates without maxOutputLength', () => {
        const compressed = zlib.deflateRawSync(data(65536));
        expect(inflateRawSync(compressed).length).toBe(65536);
        expect(shim.inflateRawSync).toBe(inflateRawSync);
        expect(shim.deflateRawSync).toBe(zlib.deflateRawSync);
    });
});
