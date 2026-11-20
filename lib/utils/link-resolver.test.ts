import { describe, expect, it } from 'vitest';

import { createLinkResolver } from './link-resolver';

describe('link resolver', () => {
    it('resolves links against their base', () => {
        const resolveLink = createLinkResolver();
        expect(resolveLink('/foo', 'https://example.com/a/b')).toBe('https://example.com/foo');
        expect(resolveLink('https://example.org/x', 'https://example.com')).toBe('https://example.org/x');
        expect(resolveLink('https://example.org/x')).toBe('https://example.org/x');
        expect(() => resolveLink('#')).toThrow(TypeError);
    });

    it('leaves links alone once the budget is spent', () => {
        const base = `https://example.com/?${'a'.repeat(100)}`;
        const resolveLink = createLinkResolver(250);
        expect(resolveLink('#', base)).toBe(`${base}#`);
        expect(resolveLink('#', base)).toBe(`${base}#`);
        expect(resolveLink('#', base)).toBe(`${base}#`);
        expect(resolveLink('#', base)).toBe('#');
        expect(resolveLink('https://example.org/x', base)).toBe('https://example.org/x');
        expect(() => resolveLink('#')).not.toThrow();
    });

    it('only charges what resolving adds', () => {
        const resolveLink = createLinkResolver(10);
        for (let i = 0; i < 100; i++) {
            expect(resolveLink('https://example.com/abs', 'https://example.com/?aaaaaaaaaaaaaaaaaaaa')).toBe('https://example.com/abs');
        }
        expect(resolveLink('/rel', 'https://example.com/?aaaaaaaaaaaaaaaaaaaa')).toBe('https://example.com/rel');
    });
});
