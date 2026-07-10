import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn(() => Promise.resolve(new Response('ok')));

// The module captures the global fetch at import time, so stub before importing
const loadWrappedFetch = async () => {
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    return (await import('@/utils/request-rewriter/fetch.worker')).default;
};

const lastRequest = () => fetchMock.mock.lastCall?.[0] as unknown as Request;

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('worker fetch wrapper', () => {
    it('applies a browser fingerprint when no user-agent is set', async () => {
        const wrappedFetch = await loadWrappedFetch();
        await wrappedFetch('https://example.com/page');

        const request = lastRequest();
        expect(request.headers.get('user-agent')).toContain('Chrome');
        expect(request.headers.get('sec-ch-ua-platform')).toBe('"macOS"');
        expect(request.headers.get('accept-language')).toBe('en-US,en;q=0.9');
    });

    it('keeps a caller-provided user-agent and headers', async () => {
        const wrappedFetch = await loadWrappedFetch();
        await wrappedFetch('https://example.com/page', {
            headers: {
                'user-agent': 'custom-ua',
                'sec-fetch-site': 'same-origin',
            },
        });

        const request = lastRequest();
        expect(request.headers.get('user-agent')).toBe('custom-ua');
        expect(request.headers.get('sec-fetch-site')).toBe('same-origin');
    });

    it('sets the referer to the request origin when absent', async () => {
        const wrappedFetch = await loadWrappedFetch();
        await wrappedFetch('https://example.com/deep/page?q=1');

        expect(lastRequest().headers.get('referer')).toBe('https://example.com');
    });

    it('keeps a caller-provided referer', async () => {
        const wrappedFetch = await loadWrappedFetch();
        await wrappedFetch('https://example.com/page', {
            headers: {
                referer: 'https://referrer.test/',
            },
        });

        expect(lastRequest().headers.get('referer')).toBe('https://referrer.test/');
    });

    it('strips the x-prefer-proxy header', async () => {
        const wrappedFetch = await loadWrappedFetch();
        await wrappedFetch('https://example.com/page', {
            headers: {
                'x-prefer-proxy': '1',
            },
        });

        expect(lastRequest().headers.has('x-prefer-proxy')).toBe(false);
    });
});
