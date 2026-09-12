import { Context } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import middleware from '../lib/middleware/cache';

const cache = vi.hoisted(() => ({
    supportsAtomicClaims: false,
    get: vi.fn(),
    set: vi.fn(),
    claim: vi.fn(),
}));
vi.mock('../lib/utils/cache/index', () => ({ default: { status: { available: true }, globalCache: cache } }));
vi.mock('../lib/config', () => ({ config: { format: 'rss', cache: { requestTimeout: 60, routeExpire: 300 } } }));

const context = () => new Context(new Request('https://rsshub.example/test/cache'), { env: {}, path: '/test/cache' });
const feed = { title: 'Feed', link: 'https://example.com', item: [{ title: 'Entry', link: 'https://example.com/entry' }] };
const isControl = (key: string) => key.startsWith('rsshub:path-requested:');

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    cache.supportsAtomicClaims = false;
    // Model a stale remote control key, including after the prior writer finished.
    cache.get.mockImplementation((key: string) => (isControl(key) ? '1' : null));
    cache.claim.mockResolvedValue(false);
});

afterEach(() => {
    vi.useRealTimers();
});

describe('cache coordination capabilities', () => {
    it('serves an HTTP/KV feed hit without touching a stale remote lock', async () => {
        cache.get.mockImplementation((key: string) => (isControl(key) ? '1' : JSON.stringify(feed)));
        const ctx = context();

        await middleware(ctx, vi.fn());

        expect(ctx.get('data')).toEqual(feed);
        expect(ctx.res.headers.get('RSSHub-Cache-Status')).toBe('HIT');
        expect(cache.get).toHaveBeenCalledTimes(1);
        expect(cache.claim).not.toHaveBeenCalled();
        expect(cache.set).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('fetches and caches HTTP/KV misses without waiting on or writing control keys', async () => {
        const ctx = context();
        const next = vi.fn(() => {
            ctx.set('data', structuredClone(feed));
            return Promise.resolve();
        });

        await middleware(ctx, next);

        expect(next).toHaveBeenCalledOnce();
        expect(cache.get.mock.calls.every(([key]) => !isControl(key))).toBe(true);
        expect(cache.claim).not.toHaveBeenCalled();
        expect(cache.set).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/^rsshub:koa-redis-cache:/), expect.any(String), 300);
        expect(JSON.parse(cache.set.mock.calls[0][1])).toMatchObject(feed);
        expect(ctx.get('cacheControlKey')).toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('allows concurrent HTTP/KV cold misses even when remote reads remain stale', async () => {
        const contexts = [context(), context()];
        const fetcher = vi.fn((ctx: Context) => {
            ctx.set('data', structuredClone(feed));
            return Promise.resolve();
        });

        await Promise.all(contexts.map((ctx) => middleware(ctx, () => fetcher(ctx))));

        expect(fetcher).toHaveBeenCalledTimes(2);
        expect(cache.claim).not.toHaveBeenCalled();
        expect(cache.get.mock.calls.every(([key]) => !isControl(key))).toBe(true);
        expect(cache.set.mock.calls.every(([key]) => !isControl(key))).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not release a remote control key when an HTTP/KV route fails', async () => {
        await expect(middleware(context(), () => Promise.reject(new Error('route failed')))).rejects.toThrow('route failed');
        expect(cache.set).not.toHaveBeenCalled();
        expect(cache.claim).not.toHaveBeenCalled();
    });

    it('keeps atomic backends single-flight and serves the waiting request from the completed feed', async () => {
        cache.supportsAtomicClaims = true;
        const entries = new Map<string, string>();
        cache.get.mockImplementation((key: string) => entries.get(key));
        cache.set.mockImplementation((key: string, value: string) => entries.set(key, value));
        cache.claim.mockImplementation((key: string) => {
            if (entries.get(key) === '1') {
                return false;
            }
            entries.set(key, '1');
            return true;
        });
        const { promise: producerReady, resolve: markReady } = Promise.withResolvers<void>();
        const { promise: releaseProducer, resolve: release } = Promise.withResolvers<void>();
        const first = context();
        const second = context();
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
        expect(cache.set.mock.calls.filter(([key]) => !isControl(key))).toHaveLength(1);
        expect(cache.set.mock.calls.filter(([key, value]) => isControl(key) && value === '0')).toHaveLength(1);
    });

    it.each(['route', 'cache write'])('releases an owned atomic claim when the %s fails', async (failure) => {
        cache.supportsAtomicClaims = true;
        cache.claim.mockResolvedValue(true);
        cache.set.mockImplementation((key: string) => {
            if (!isControl(key)) {
                throw new Error('cache write failed');
            }
        });
        const ctx = context();
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
        cache.supportsAtomicClaims = true;
        cache.get.mockResolvedValue(null);
        cache.claim.mockResolvedValue(false);
        const next = vi.fn();
        const result = expect(middleware(context(), next)).rejects.toThrow('This path is currently fetching');
        await vi.advanceTimersByTimeAsync(6000);
        await result;

        expect(cache.claim).toHaveBeenCalledTimes(2);
        expect(cache.set).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});
