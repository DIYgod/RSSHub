import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as WorkerCache from '../lib/utils/cache/index.worker';

vi.mock('../lib/config', () => ({
    config: {
        cache: {
            type: 'http',
            routeExpire: 300,
            contentExpire: 600,
        },
        httpCache: {
            url: 'https://cache.example.com/',
            token: 'worker-cache-token',
        },
        requestTimeout: 1000,
        loggerLevel: 'error',
    },
}));

type StoredValue = { ttl: number; value: string };

let cache: typeof WorkerCache.default;
let setKVNamespace: typeof WorkerCache.setKVNamespace;
const values = new Map<string, StoredValue>();

const handleCacheRequest = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input.toString());
    const key = url.pathname;

    if (init?.method === 'PUT') {
        values.set(key, JSON.parse(init.body!.toString()));
        return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (init?.method === 'HEAD') {
        return Promise.resolve(new Response(null, { status: values.has(key) ? 204 : 404 }));
    }

    const stored = values.get(key);
    return Promise.resolve(stored ? Response.json({ hit: true, value: stored.value }) : Response.json({ hit: false }, { status: 404 }));
};

const fetchMock = vi.fn(handleCacheRequest);

beforeEach(async () => {
    vi.resetModules();
    values.clear();
    fetchMock.mockReset().mockImplementation(handleCacheRequest);
    vi.stubGlobal('fetch', fetchMock);

    const module = await import('../lib/utils/cache/index.worker');
    cache = module.default;
    setKVNamespace = module.setKVNamespace;
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('worker HTTP cache', () => {
    it('initializes without I/O and keeps using HTTP when a KV binding is present', async () => {
        expect(cache.status.available).toBe(true);
        expect(cache.globalCache.supportsAtomicClaims).toBe(false);
        expect(fetchMock).not.toHaveBeenCalled();

        setKVNamespace(env.CACHE);
        await cache.set('worker:http-selected', 'http-value');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(await env.CACHE.get('worker:http-selected')).toBeNull();
        expect(await cache.get('worker:http-selected')).toBe('http-value');
    });

    it('uses authenticated hashed keys for get, has, and set', async () => {
        await cache.set('worker:http-protocol', { ok: true }, 120);
        expect(await cache.get('worker:http-protocol')).toBe('{"ok":true}');
        expect(await cache.get('worker:http-protocol', false)).toBe('{"ok":true}');
        expect(await cache.has('worker:http-protocol')).toBe(true);
        expect(await cache.has('worker:http-missing')).toBe(false);

        const [[putUrl, putInit], [getUrl], [nonRefreshingUrl], [headUrl, headInit]] = fetchMock.mock.calls;
        expect(putUrl).toMatch(/^https:\/\/cache\.example\.com\/v1\/cache\/rsshub%3Ahttp-cache%3A[a-f0-9]{32}$/);
        expect(putInit?.headers).toMatchObject({ authorization: 'Bearer worker-cache-token', 'content-type': 'application/json' });
        expect(JSON.parse(putInit!.body!.toString())).toEqual({ ttl: 120, value: '{"ok":true}' });
        expect(getUrl).toBe(`${putUrl}?refresh=1`);
        expect(nonRefreshingUrl).toBe(putUrl);
        expect(headUrl).toBe(putUrl);
        expect(headInit?.method).toBe('HEAD');
    });

    it('reads global entries without refreshing and defaults their writes to the route expiry', async () => {
        await cache.globalCache.set('worker:http-global', { lastBuildDate: 'Sat, 5 Sep 2026 00:00:00 GMT' });
        expect(await cache.globalCache.get('worker:http-global')).toBe('{"lastBuildDate":"Sat, 5 Sep 2026 00:00:00 GMT"}');
        expect(await cache.globalCache.has('worker:http-global')).toBe(true);
        expect(await cache.globalCache.has('worker:http-global-missing')).toBe(false);

        const [[putUrl, putInit], [getUrl], [headUrl, headInit]] = fetchMock.mock.calls;
        expect(JSON.parse(putInit!.body!.toString()).ttl).toBe(300);
        expect(getUrl).toBe(putUrl);
        expect(headUrl).toBe(putUrl);
        expect(headInit?.method).toBe('HEAD');
    });

    it('claims through non-refreshing HTTP reads and only writes an unclaimed key', async () => {
        expect(await cache.globalCache.claim('worker:http-claim', 60)).toBe(true);
        expect(await cache.globalCache.claim('worker:http-claim', 60)).toBe(false);

        expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(['GET', 'PUT', 'GET']);
        expect(fetchMock.mock.calls.every(([url]) => !url.toString().includes('?refresh=1'))).toBe(true);
        expect(JSON.parse(fetchMock.mock.calls[1][1]!.body!.toString())).toEqual({ ttl: 60, value: '1' });
    });

    it('awaits a cache-miss write and returns parsed JSON on a subsequent hit', async () => {
        const { promise: writeStarted, resolve: startWrite } = Promise.withResolvers<void>();
        const { promise: writeReleased, resolve: releaseWrite } = Promise.withResolvers<void>();
        fetchMock.mockImplementation(async (input, init) => {
            if (init?.method === 'PUT') {
                startWrite();
                await writeReleased;
            }
            return handleCacheRequest(input, init);
        });

        const getValue = vi.fn().mockResolvedValue({ cached: true });
        let finished = false;
        const miss = (async () => {
            const value = await cache.tryGet('worker:http-tryget', getValue);
            finished = true;
            return value;
        })();
        await writeStarted;
        await Promise.resolve();
        expect(finished).toBe(false);

        releaseWrite();
        expect(await miss).toEqual({ cached: true });
        expect(await cache.tryGet('worker:http-tryget', getValue, 600, false)).toEqual({ cached: true });
        expect(getValue).toHaveBeenCalledTimes(1);

        const [[missUrl], [, putInit], [hitUrl]] = fetchMock.mock.calls;
        expect(missUrl).toMatch(/\?refresh=1$/);
        expect(hitUrl).not.toContain('?refresh=1');
        expect(JSON.parse(putInit!.body!.toString())).toEqual({ ttl: 600, value: '{"cached":true}' });
    });

    it('falls back to fresh values after HTTP authentication makes the cache unavailable', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
        expect(await cache.globalCache.get('worker:http-unauthorized')).toBeNull();
        expect(cache.status.available).toBe(false);

        const getValue = vi.fn().mockResolvedValue('fresh');
        expect(await cache.tryGet('worker:http-unavailable', getValue)).toBe('fresh');
        expect(await cache.tryGet('worker:http-unavailable', getValue)).toBe('fresh');
        expect(getValue).toHaveBeenCalledTimes(2);
        expect(await cache.globalCache.get('worker:http-unavailable')).toBeUndefined();
        expect(await cache.globalCache.has('worker:http-unavailable')).toBe(false);
        expect(await cache.globalCache.claim('worker:http-unavailable', 60)).toBe(true);
        await cache.globalCache.set('worker:http-unavailable', 'ignored');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
