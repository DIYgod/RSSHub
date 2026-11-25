import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createRequire } from '@/shims/node-module';
import zlib from '@/shims/zlib';

describe('node:module shim', () => {
    const require = createRequire();

    it.each(['zlib', 'node:zlib'])('hands out the zlib shim for %s', (id) => {
        expect(require(id)).toBe(zlib);
    });

    it.each(['process', 'node:process'])('hands out the global process for %s', (id) => {
        expect(require(id)).toBe(process);
    });

    it('passes other modules to the native require', () => {
        expect(require('node:path')).toBe(path);
    });
});
