import { Context } from 'hono';
import Parser from 'rss-parser';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import wait from '@/utils/wait';

process.env.CACHE_EXPIRE = '1';
process.env.CACHE_CONTENT_EXPIRE = '2';

const parser = new Parser();

afterEach(() => {
    vi.resetModules();
});

const noCacheTestFunc = async () => {
    const app = (await import('@/app')).default;

    const response1 = await app.request('/test/cache');
    const response2 = await app.request('/test/cache');

    const parsed1 = await parser.parseString(await response1.text());
    const parsed2 = await parser.parseString(await response2.text());

    expect(response2.status).toBe(200);
    expect(response2.headers).not.toHaveProperty('rsshub-cache-status');

    expect(parsed1.items[0].content).toBe('Cache1');
    expect(parsed2.items[0].content).toBe('Cache2');

    expect(parsed1.ttl).toEqual('1');
};

describe('cache', () => {
    it('memory', async () => {
        process.env.CACHE_TYPE = 'memory';
        const app = (await import('@/app')).default;

        const response1 = await app.request('/test/cache');
        const response2 = await app.request('/test/cache');

        const parsed1 = await parser.parseString(await response1.text());
        const parsed2 = await parser.parseString(await response2.text());

        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);

        expect(response2.status).toBe(200);
        expect(response2.headers.get('rsshub-cache-status')).toBe('HIT');

        expect(parsed1.ttl).toEqual('1');

        await wait(1 * 1000 + 100);
        const response3 = await app.request('/test/cache');
        expect(response3.headers).not.toHaveProperty('rsshub-cache-status');
        const parsed3 = await parser.parseString(await response3.text());

        await wait(2 * 1000 + 100);
        const response4 = await app.request('/test/cache');
        const parsed4 = await parser.parseString(await response4.text());

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache1');
        expect(parsed3.items[0].content).toBe('Cache1');
        expect(parsed4.items[0].content).toBe('Cache2');

        await app.request('/test/refreshCache');
        await wait(1 * 1000 + 100);
        const response5 = await app.request('/test/refreshCache');
        const parsed5 = await parser.parseString(await response5.text());
        await wait(1 * 1000 + 100);
        const response6 = await app.request('/test/refreshCache');
        const parsed6 = await parser.parseString(await response6.text());

        expect(parsed5.items[0].content).toBe('1 1');
        expect(parsed6.items[0].content).toBe('1 0');
    }, 10000);

    it('redis', async () => {
        process.env.CACHE_TYPE = 'redis';
        const app = (await import('@/app')).default;

        await wait(500);
        const response1 = await app.request('/test/cache');
        const response2 = await app.request('/test/cache');

        const parsed1 = await parser.parseString(await response1.text());
        const parsed2 = await parser.parseString(await response2.text());

        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);

        expect(response2.status).toBe(200);
        expect(response2.headers.get('rsshub-cache-status')).toBe('HIT');

        expect(parsed1.ttl).toEqual('1');

        await wait(1 * 1000 + 100);
        const response3 = await app.request('/test/cache');
        expect(response3.headers).not.toHaveProperty('rsshub-cache-status');
        const parsed3 = await parser.parseString(await response3.text());

        await wait(2 * 1000 + 100);
        const response4 = await app.request('/test/cache');
        const parsed4 = await parser.parseString(await response4.text());

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache1');
        expect(parsed3.items[0].content).toBe('Cache1');
        expect(parsed4.items[0].content).toBe('Cache2');

        await app.request('/test/refreshCache');
        await wait(1 * 1000 + 100);
        const response5 = await app.request('/test/refreshCache');
        const parsed5 = await parser.parseString(await response5.text());
        await wait(1 * 1000 + 100);
        const response6 = await app.request('/test/refreshCache');
        const parsed6 = await parser.parseString(await response6.text());

        expect(parsed5.items[0].content).toBe('1 1');
        expect(parsed6.items[0].content).toBe('1 0');

        const cache = (await import('@/utils/cache')).default;
        await cache.clients.redisClient!.quit();
    }, 10000);

    it('redis with quit', async () => {
        process.env.CACHE_TYPE = 'redis';
        const cache = (await import('@/utils/cache')).default;
        await cache.clients.redisClient!.quit();
        await noCacheTestFunc();
    });

    it('redis with error', async () => {
        process.env.CACHE_TYPE = 'redis';
        process.env.REDIS_URL = 'redis://wrongpath:6379';
        await noCacheTestFunc();
        const cache = (await import('@/utils/cache')).default;
        cache.clients.redisClient?.disconnect();
    }, 20000);

    it('no cache', async () => {
        process.env.CACHE_TYPE = 'NO';
        await noCacheTestFunc();
    });

    it('no cache (empty string)', async () => {
        process.env.CACHE_TYPE = '';
        await noCacheTestFunc();
    });

    it('throws URL key', async () => {
        process.env.CACHE_TYPE = 'memory';
        const app = (await import('@/app')).default;

        try {
            const response = await app.request('/test/cacheUrlKey');
            expect(response).toThrow(Error);
        } catch (error: any) {
            expect(error.message).toContain('Cache key must be a string');
        }
    });

    it('RSS TTL (no cache)', async () => {
        process.env.CACHE_TYPE = '';
        process.env.CACHE_EXPIRE = '600';
        const app = (await import('@/app')).default;
        const response = await app.request('/test/cache');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.ttl).toEqual('1');
    });

    it('RSS TTL (w/ cache)', async () => {
        process.env.CACHE_TYPE = 'memory';
        process.env.CACHE_EXPIRE = '600';
        const app = (await import('@/app')).default;
        const response = await app.request('/test/cache');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.ttl).toEqual('10');
    });
});

describe('cache middleware error handling', () => {
    it('clears control key when downstream throws', async () => {
        process.env.CACHE_TYPE = 'memory';
        const cache = (await import('@/utils/cache')).default;
        const setSpy = vi.spyOn(cache.globalCache, 'set');

        const { default: cacheMiddleware } = await import('@/middleware/cache');

        const ctx = new Context(new Request('http://localhost/test'), { env: {}, path: '/test' });

        await expect(
            cacheMiddleware(ctx, () => {
                throw new Error('boom');
            })
        ).rejects.toThrow('boom');

        expect(setSpy.mock.calls.some(([key, value]) => key.startsWith('rsshub:path-requested:') && value === '0')).toBe(true);
        setSpy.mockRestore();
    });
});

const coordinationContext = () => new Context(new Request('https://rsshub.example/test/cache'), { env: {}, path: '/test/cache' });
const isControlKey = (key: string) => key.startsWith('rsshub:path-requested:');
const loadCoordination = async () => {
    // Pin the config values asserted below before the middleware loads the config.
    vi.stubEnv('CACHE_TYPE', 'memory');
    vi.stubEnv('FORMAT', 'rss');
    vi.stubEnv('CACHE_REQUEST_TIMEOUT', '60');
    vi.stubEnv('CACHE_EXPIRE', '300');
    vi.resetModules();
    const { default: middleware } = await import('./cache');
    const { default: cacheModule } = await import('@/utils/cache/index');
    const { globalCache } = cacheModule;
    return {
        middleware,
        cacheModule,
        globalCache,
        cache: {
            get: vi.spyOn(globalCache, 'get'),
            set: vi.spyOn(globalCache, 'set'),
            claim: vi.spyOn(globalCache, 'claim'),
        },
    };
};
type Loaded = Awaited<ReturnType<typeof loadCoordination>>;

describe('cache coordination capabilities', () => {
    let middleware: Loaded['middleware'];
    let cacheModule: Loaded['cacheModule'];
    let globalCache: Loaded['globalCache'];
    let cache: Loaded['cache'];
    let originalSupportsAtomicClaims: boolean;

    const feed = { title: 'Feed', link: 'https://example.com', item: [{ title: 'Entry', link: 'https://example.com/entry' }] };

    beforeAll(async () => {
        ({ middleware, cacheModule, globalCache, cache } = await loadCoordination());
        originalSupportsAtomicClaims = globalCache.supportsAtomicClaims;
    });

    beforeEach(() => {
        vi.resetAllMocks();
        cache.set.mockReturnValue(undefined);
        vi.useFakeTimers();
        globalCache.supportsAtomicClaims = false;
        // Model a stale remote control key, including after the prior writer finished.
        cache.get.mockImplementation((key: string) => (isControlKey(key) ? '1' : null));
        cache.claim.mockResolvedValue(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    afterAll(() => {
        globalCache.supportsAtomicClaims = originalSupportsAtomicClaims;
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('serves an HTTP/KV feed hit without touching a stale remote lock', async () => {
        cache.get.mockImplementation((key: string) => (isControlKey(key) ? '1' : JSON.stringify(feed)));
        const ctx = coordinationContext();

        await middleware(ctx, vi.fn());

        expect(ctx.get('data')).toEqual(feed);
        expect(ctx.res.headers.get('RSSHub-Cache-Status')).toBe('HIT');
        expect(cache.get).toHaveBeenCalledTimes(1);
        expect(cache.claim).not.toHaveBeenCalled();
        expect(cache.set).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('fetches and caches HTTP/KV misses without waiting on or writing control keys', async () => {
        const ctx = coordinationContext();
        const next = vi.fn(() => {
            ctx.set('data', structuredClone(feed));
            return Promise.resolve();
        });

        await middleware(ctx, next);

        expect(next).toHaveBeenCalledOnce();
        expect(cache.get.mock.calls.every(([key]) => !isControlKey(key))).toBe(true);
        expect(cache.claim).not.toHaveBeenCalled();
        expect(cache.set).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/^rsshub:koa-redis-cache:/), expect.any(String), 300);
        expect(JSON.parse(String(cache.set.mock.calls[0][1]))).toMatchObject(feed);
        expect(ctx.get('cacheControlKey')).toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('allows concurrent HTTP/KV cold misses even when remote reads remain stale', async () => {
        const contexts = [coordinationContext(), coordinationContext()];
        const fetcher = vi.fn((ctx: Context) => {
            ctx.set('data', structuredClone(feed));
            return Promise.resolve();
        });

        await Promise.all(contexts.map((ctx) => middleware(ctx, () => fetcher(ctx))));

        expect(fetcher).toHaveBeenCalledTimes(2);
        expect(cache.claim).not.toHaveBeenCalled();
        expect(cache.get.mock.calls.every(([key]) => !isControlKey(key))).toBe(true);
        expect(cache.set.mock.calls.every(([key]) => !isControlKey(key))).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not release a remote control key when an HTTP/KV route fails', async () => {
        await expect(middleware(coordinationContext(), () => Promise.reject(new Error('route failed')))).rejects.toThrow('route failed');
        expect(cache.set).not.toHaveBeenCalled();
        expect(cache.claim).not.toHaveBeenCalled();
    });

    it('keeps atomic backends single-flight and serves the waiting request from the completed feed', async () => {
        // Use the real memory backend, which claims atomically.
        globalCache.supportsAtomicClaims = true;
        cacheModule.clients.memoryCache?.clear();
        cache.get.mockReset();
        cache.set.mockReset();
        cache.claim.mockReset();
        const { promise: producerReady, resolve: markReady } = Promise.withResolvers<void>();
        const { promise: releaseProducer, resolve: release } = Promise.withResolvers<void>();
        const first = coordinationContext();
        const second = coordinationContext();
        const fetcher = vi.fn(async (ctx: Context) => {
            if (ctx.get('data')) {
                return;
            }
            markReady();
            await releaseProducer;
            ctx.set('data', structuredClone(feed));
        });
        const producer = middleware(first, () => fetcher(first));
        await producerReady;
        const waiter = middleware(second, () => fetcher(second));
        await vi.advanceTimersByTimeAsync(0);
        expect(cache.claim).toHaveBeenCalledTimes(2);
        release();
        await producer;
        await vi.advanceTimersByTimeAsync(6000);
        await waiter;

        expect(second.res.headers.get('RSSHub-Cache-Status')).toBe('HIT');
        expect(second.get('data')).toMatchObject(feed);
        expect(cache.set.mock.calls.filter(([key]) => !isControlKey(key))).toHaveLength(1);
        expect(cache.set.mock.calls.filter(([key, value]) => isControlKey(key) && value === '0')).toHaveLength(1);
    });

    it.each(['route', 'cache write'])('releases an owned atomic claim when the %s fails', async (failure) => {
        globalCache.supportsAtomicClaims = true;
        cache.claim.mockResolvedValue(true);
        cache.set.mockImplementation((key: string) => {
            if (!isControlKey(key)) {
                throw new Error('cache write failed');
            }
        });
        const ctx = coordinationContext();
        const next = () => {
            if (failure === 'route') {
                return Promise.reject(new Error('route failed'));
            }
            ctx.set('data', structuredClone(feed));
            return Promise.resolve();
        };

        await expect(middleware(ctx, next)).rejects.toThrow(`${failure} failed`);
        expect(cache.set).toHaveBeenCalledWith(expect.stringMatching(/^rsshub:path-requested:/), '0', 60);
    });

    it('does not overwrite or release a competing atomic claim during takeover', async () => {
        globalCache.supportsAtomicClaims = true;
        cache.get.mockResolvedValue(null);
        cache.claim.mockResolvedValue(false);
        const next = vi.fn();
        const result = expect(middleware(coordinationContext(), next)).rejects.toThrow('This path is currently fetching');
        await vi.advanceTimersByTimeAsync(6000);
        await result;

        expect(cache.claim).toHaveBeenCalledTimes(2);
        expect(cache.set).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});
