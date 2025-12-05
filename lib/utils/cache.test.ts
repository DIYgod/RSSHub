import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import wait from '@/utils/wait';

beforeAll(() => {
    process.env.CACHE_EXPIRE = '1';
    process.env.CACHE_CONTENT_EXPIRE = '3';
});

afterEach(() => {
    delete process.env.CACHE_TYPE;
    vi.resetModules();
});

afterAll(() => {
    delete process.env.CACHE_EXPIRE;
});

describe('cache', () => {
    it('memory', async () => {
        process.env.CACHE_TYPE = 'memory';
        const cache = (await import('@/utils/cache')).default;
        if (!cache.clients.memoryCache || !cache.status.available) {
            throw new Error('Memory cache client error');
        }
        await cache.set('mock', undefined);
        expect(await cache.get('mock')).toBe('');

        await cache.globalCache.set('mock', undefined);
        expect(await cache.globalCache.get('mock')).toBe('');
        await cache.globalCache.set('mock', {
            mock: 1,
        });
        expect(await cache.globalCache.get('mock')).toBe('{"mock":1}');
    }, 10000);

    it('redis', async () => {
        process.env.CACHE_TYPE = 'redis';
        const cache = (await import('@/utils/cache')).default;
        await wait(500);
        if (!cache.clients.redisClient || !cache.status.available) {
            throw new Error('Redis client error');
        }
        await cache.set('mock1', undefined);
        expect(await cache.get('mock1')).toBe('');
        await cache.set('mock2', '2');
        await cache.set('mock2', '2');
        expect(await cache.get('mock2')).toBe('2');
        await cache.clients.redisClient?.quit();
    }, 10000);

    it('redis with quit', async () => {
        process.env.CACHE_TYPE = 'redis';
        const cache = (await import('@/utils/cache')).default;
        if (cache.clients.redisClient) {
            await cache.clients.redisClient.quit();
        } else {
            throw new Error('No redis client');
        }
        await cache.set('mock2', '2');
        expect(await cache.get('mock2')).toBe(null);
    });

    it('redis with error', async () => {
        process.env.CACHE_TYPE = 'redis';
        process.env.REDIS_URL = 'redis://wrongpath:6379';
        const cache = (await import('@/utils/cache')).default;
        await cache.set('mock2', '2');
        expect(await cache.get('mock2')).toBe(null);
        await cache.clients.redisClient?.quit();
    });

    it('no cache', async () => {
        process.env.CACHE_TYPE = 'NO';
        const cache = (await import('@/utils/cache')).default;
        await cache.set('mock2', '2');
        expect(await cache.get('mock2')).toBe(null);
    });

    it('throws TTL key', async () => {
        process.env.CACHE_TYPE = 'redis';
        const cache = (await import('@/utils/cache')).default;

        try {
            await cache.get('rsshub:cacheTtl:mock');
        } catch (error: any) {
            expect(error.message).toContain('reserved for the internal usage');
        } finally {
            await cache.clients.redisClient?.quit();
        }
    });
});
