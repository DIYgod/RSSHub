import { afterEach, describe, expect, it, vi } from 'vitest';

import { config } from '@/config';

const fetchMock = vi.fn<(request: Request) => Promise<Response>>(() => Promise.resolve(new Response('ok')));

// The module captures the global fetch at import time, so stub before importing
const loadWrappedFetch = async () => {
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    return (await import('@/utils/request-rewriter/fetch.worker')).default;
};

const lastRequest = () => {
    const request = fetchMock.mock.lastCall?.[0];
    if (!request) {
        throw new Error('the wrapper did not call fetch');
    }
    return request;
};

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

    it('fails a body that is larger than the limit', async () => {
        const wrappedFetch = await loadWrappedFetch();
        const limit = config.requestMaxResponseSize;

        fetchMock.mockResolvedValueOnce(new Response('x'.repeat(limit), { status: 201, headers: { 'x-custom': 'kept' } }));
        const response = await wrappedFetch('https://example.com/page');
        expect(response.status).toBe(201);
        expect(response.headers.get('x-custom')).toBe('kept');
        expect(await response.text()).toHaveLength(limit);

        fetchMock.mockResolvedValueOnce(new Response('x'.repeat(limit + 1)));
        await expect((await wrappedFetch('https://example.com/page')).text()).rejects.toThrow(`Response body is larger than ${limit} bytes`);

        fetchMock.mockResolvedValueOnce(new Response('x'.repeat(limit + 1)));
        expect(await (await wrappedFetch('https://example.com/page', { maxResponseSize: limit + 1 })).text()).toHaveLength(limit + 1);
    });
});

const redirectTo = (location: string) => new Response(null, { status: 302, headers: { location } });

describe('worker fetch wrapper redirects', () => {
    const init = {
        headers: {
            authorization: 'Bearer token',
            'X-Auth-Token': 'secret',
            'x-custom': 'kept',
        },
        credentialHeaders: ['X-Auth-Token'],
    };

    it('lets the platform follow redirects when no credential is sent', async () => {
        const wrappedFetch = await loadWrappedFetch();
        fetchMock.mockResolvedValueOnce(redirectTo('https://other.test/landing'));
        const response = await wrappedFetch('https://example.com/page', { headers: { 'x-custom': 'kept' } });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(lastRequest().redirect).toBe('follow');
        expect(response.status).toBe(302);
    });

    it('drops credentials when a redirect leaves the origin', async () => {
        const wrappedFetch = await loadWrappedFetch();
        fetchMock.mockResolvedValueOnce(redirectTo('https://other.test/landing'));
        const response = await wrappedFetch('https://example.com/page', init);

        expect(await response.text()).toBe('ok');
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const first = fetchMock.mock.calls[0][0];
        expect(first.redirect).toBe('manual');
        expect(first.headers.get('x-auth-token')).toBe('secret');
        const request = lastRequest();
        expect(request.url).toBe('https://other.test/landing');
        expect(request.headers.has('authorization')).toBe(false);
        expect(request.headers.has('x-auth-token')).toBe(false);
        expect(request.headers.get('x-custom')).toBe('kept');
    });

    it('keeps credentials when a redirect stays on the origin', async () => {
        const wrappedFetch = await loadWrappedFetch();
        fetchMock.mockResolvedValueOnce(redirectTo('/moved'));
        await wrappedFetch('https://example.com/page', init);

        const request = lastRequest();
        expect(request.url).toBe('https://example.com/moved');
        expect(request.headers.get('authorization')).toBe('Bearer token');
        expect(request.headers.get('x-auth-token')).toBe('secret');
    });

    it('does not restore credentials when a redirect returns to the origin', async () => {
        const wrappedFetch = await loadWrappedFetch();
        fetchMock.mockResolvedValueOnce(redirectTo('https://other.test/landing')).mockResolvedValueOnce(redirectTo('https://example.com/back'));
        await wrappedFetch('https://example.com/page', init);

        expect(fetchMock).toHaveBeenCalledTimes(3);
        const request = lastRequest();
        expect(request.url).toBe('https://example.com/back');
        expect(request.headers.has('x-auth-token')).toBe(false);
    });

    it('turns a redirected POST into a GET without its body', async () => {
        const wrappedFetch = await loadWrappedFetch();
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 303, headers: { location: 'https://example.com/result' } }));
        await wrappedFetch('https://example.com/submit', { ...init, method: 'POST', body: 'a=b', headers: { ...init.headers, 'content-type': 'application/x-www-form-urlencoded' } });

        const request = lastRequest();
        expect(request.method).toBe('GET');
        expect(request.body).toBeNull();
        expect(request.headers.has('content-type')).toBe(false);
        expect(request.headers.get('x-auth-token')).toBe('secret');
    });

    it('gives up after too many redirects', async () => {
        const wrappedFetch = await loadWrappedFetch();
        fetchMock.mockImplementation(() => Promise.resolve(redirectTo('https://example.com/loop')));

        await expect(wrappedFetch('https://example.com/page', init)).rejects.toThrow('Too many redirects');
    });
});
