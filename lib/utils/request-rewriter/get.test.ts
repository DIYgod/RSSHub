import { describe, expect, it, vi } from 'vitest';

import getWrappedGet from '@/utils/request-rewriter/get';

describe('request-rewriter get wrapper', () => {
    it('passes callback when url and callback are provided', () => {
        const origin = vi.fn<(...args: any[]) => string>(() => 'ok');
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
        const options = { href: 'http://' };

        const result = wrapped(options, callback);

        expect(result).toBe('fallback');
        expect(origin).toHaveBeenCalledWith(options, callback);
    });

    it('rebuilds url from legacy options for non-CONNECT requests', () => {
        const origin = vi.fn<(...args: any[]) => string>(() => 'ok');
        const wrapped = getWrappedGet(origin as any);
        const options = { protocol: 'https:', host: 'example.com', path: '/test?a=1', method: 'POST' };

        wrapped(options);

        expect(origin).toHaveBeenCalledTimes(1);
        const [url, passedOptions] = origin.mock.calls[0];
        expect(url).toBeInstanceOf(URL);
        expect(url.href).toBe('https://example.com/test?a=1');
        expect(passedOptions.headers['user-agent']).toBeTruthy();
    });

    it('passes CONNECT proxy tunnel requests to origin untouched', () => {
        const origin = vi.fn<(...args: any[]) => string>(() => 'tunnel');
        const wrapped = getWrappedGet(origin as any);
        const callback = vi.fn();
        // shape built by tunnel-agent: `path` is the tunnel target authority, not a URL path
        const options = { host: '127.0.0.1', port: 10809, method: 'CONNECT', path: 'i.instagram.com:443', headers: { host: 'i.instagram.com:443' }, agent: false };
        const snapshot = structuredClone(options);

        const result = wrapped(options, callback);

        expect(result).toBe('tunnel');
        expect(origin).toHaveBeenCalledTimes(1);
        expect(origin.mock.calls[0][0]).toBe(options);
        expect(origin.mock.calls[0][1]).toBe(callback);
        expect(options).toEqual(snapshot);
    });
});
