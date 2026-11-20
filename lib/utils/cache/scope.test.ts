import { afterEach, describe, expect, it, vi } from 'vitest';

import { runInCacheNamespace, scopeCacheKey } from './scope';

describe('cache key scope', () => {
    afterEach(() => {
        delete process.env.CACHE_TYPE;
        vi.resetModules();
    });

    it('prefixes keys with the namespace of the running route', () => {
        expect(scopeCacheKey('https://example.com/a')).toBe('https://example.com/a');
        expect(runInCacheNamespace('bast', () => scopeCacheKey('lorientlejour:token'))).toBe('bast:lorientlejour:token');
        expect(runInCacheNamespace('bast', () => scopeCacheKey('bast:detail'))).toBe('bast:detail');
    });

    it('keeps the namespace across awaits', async () => {
        const key = await runInCacheNamespace('bast', async () => {
            await new Promise((resolve) => {
                setTimeout(resolve, 1);
            });
            return scopeCacheKey('https://example.com/a');
        });
        expect(key).toBe('bast:https://example.com/a');
    });

    it('refuses internal keys', () => {
        expect(() => scopeCacheKey('rsshub:koa-redis-cache:abc')).toThrow('reserved for the internal usage');
        expect(() => runInCacheNamespace('rsshub', () => scopeCacheKey('path-requested:abc'))).toThrow('reserved for the internal usage');
        expect(() => scopeCacheKey(1 as unknown as string)).toThrow('Cache key must be a string');
    });

    it('separates content cache entries of different namespaces', async () => {
        process.env.CACHE_TYPE = 'memory';
        const cache = (await import('@/utils/cache')).default;
        // the cache module was re-imported, so use its copy of the scope
        const { runInCacheNamespace } = await import('./scope');

        await runInCacheNamespace('owner', () => cache.set('owner:token', 'secret'));
        expect(await runInCacheNamespace('owner', () => cache.get('owner:token'))).toBe('secret');
        expect(await runInCacheNamespace('other', () => cache.get('owner:token'))).toBeNull();
        const value = await runInCacheNamespace('other', () => cache.tryGet('owner:token', () => Promise.resolve({ title: 'fresh' })));
        expect(value).toEqual({ title: 'fresh' });
        expect(await runInCacheNamespace('owner', () => cache.get('owner:token'))).toBe('secret');
    });
});
