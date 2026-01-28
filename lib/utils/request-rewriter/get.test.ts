import { describe, expect, it, vi } from 'vitest';

import getWrappedGet from '@/utils/request-rewriter/get';

describe('request-rewriter get wrapper', () => {
    it('passes callback when url and callback are provided', () => {
        const origin = vi.fn(() => 'ok');
        const wrapped = getWrappedGet(origin as any);
        const callback = vi.fn();

        const result = wrapped('http://example.com/test', callback);

        expect(result).toBe('ok');
        expect(origin).toHaveBeenCalledTimes(1);
        expect(origin.mock.calls[0][2]).toBe(callback);
    });

    it('falls back to origin when url parsing fails', () => {
        const origin = vi.fn(() => 'fallback');
        const wrapped = getWrappedGet(origin as any);
        const callback = vi.fn();
        const options = { href: 'http://' } as any;

        const result = wrapped(options, callback);

        expect(result).toBe('fallback');
        expect(origin).toHaveBeenCalledWith(options, callback);
    });
});
