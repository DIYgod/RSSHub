import { afterEach, describe, expect, it, vi } from 'vitest';

const errorSpy = vi.fn();
const infoSpy = vi.fn();

vi.mock('@/utils/logger', () => ({
    default: {
        error: errorSpy,
        info: infoSpy,
    },
}));

const setHttpCacheEnv = () => {
    process.env.CACHE_HTTP_URL = 'https://cache.example.com/';
    process.env.CACHE_HTTP_TOKEN = 'token';
};

const clearHttpCacheEnv = () => {
    delete process.env.CACHE_TYPE;
    delete process.env.CACHE_HTTP_URL;
    delete process.env.CACHE_HTTP_TOKEN;
};

describe('http cache module', () => {
    afterEach(() => {
        clearHttpCacheEnv();
        vi.unstubAllGlobals();
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('requires endpoint and token', async () => {
        const cache = (await import('@/utils/cache/http')).default;

        cache.init();

        expect(cache.status.available).toBe(false);
        expect(errorSpy).toHaveBeenCalledWith('HTTP cache requires CACHE_HTTP_URL and CACHE_HTTP_TOKEN.');
    });

    it('sets, gets, refreshes, and checks hashed keys', async () => {
        setHttpCacheEnv();
        const requests: Array<{ body?: string; init?: RequestInit; url: string }> = [];
        const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
            requests.push({
                body: init?.body?.toString(),
                init,
                url: input.toString(),
            });

            if (init?.method === 'PUT') {
                return new Response(null, { status: 204 });
            }
            if (init?.method === 'HEAD') {
                return new Response(null, { status: 204 });
            }

            return Response.json({ hit: true, value: 'cached' });
        });
        vi.stubGlobal('fetch', fetchMock);

        const cache = (await import('@/utils/cache/http')).default;
        cache.init();

        await cache.set('mock/key', { ok: true }, 30);
        await expect(cache.get('mock/key')).resolves.toBe('cached');
        await expect(cache.get('mock/key', false)).resolves.toBe('cached');
        await expect(cache.has('mock/key')).resolves.toBe(true);

        expect(cache.status.available).toBe(true);
        expect(requests[0].url).toMatch(/^https:\/\/cache\.example\.com\/v1\/cache\/rsshub%3Ahttp-cache%3A[a-f0-9]{32}$/);
        expect(requests[0].init?.headers).toMatchObject({
            authorization: 'Bearer token',
            'content-type': 'application/json',
        });
        expect(JSON.parse(requests[0].body || '{}')).toEqual({
            ttl: 30,
            value: '{"ok":true}',
        });
        expect(requests[1].url).toMatch(/\?refresh=1$/);
        expect(requests[2].url).not.toContain('?refresh=1');
        expect(requests[3].init?.method).toBe('HEAD');
    });

    it('treats a 404 response as a miss', async () => {
        setHttpCacheEnv();
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Response.json({ hit: false }, { status: 404 }))
        );

        const cache = (await import('@/utils/cache/http')).default;
        cache.init();

        await expect(cache.get('missing')).resolves.toBe('');
        await expect(cache.has('missing')).resolves.toBe(false);
    });

    it('uses non-refreshing reads for global cache', async () => {
        process.env.CACHE_TYPE = 'http';
        setHttpCacheEnv();
        const urls: string[] = [];
        vi.stubGlobal(
            'fetch',
            vi.fn((input: RequestInfo | URL) => {
                urls.push(input.toString());
                return Response.json({ hit: true, value: 'route-cache' });
            })
        );

        const cache = (await import('@/utils/cache')).default;

        await expect(cache.globalCache.get('route/key')).resolves.toBe('route-cache');

        expect(cache.status.available).toBe(true);
        expect(urls[0]).not.toContain('?refresh=1');
    });
});
