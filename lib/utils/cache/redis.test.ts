import type Redis from 'ioredis';
import { describe, expect, it, vi } from 'vitest';

import logger from '@/utils/logger';

const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);

class RedisMock {
    private readonly listeners = new Map<string, Array<(error?: Error) => void>>();

    mget = vi.fn();
    expire = vi.fn();
    exists = vi.fn();
    set = vi.fn();

    on(event: string, listener: (error?: Error) => void) {
        const handlers = this.listeners.get(event) ?? [];
        handlers.push(listener);
        this.listeners.set(event, handlers);
        return this;
    }

    emit(event: string, error?: Error) {
        const handlers = this.listeners.get(event) ?? [];
        for (const listener of handlers) {
            listener(error);
        }
        return true;
    }
}

const asRedisClient = (mock: Pick<Redis, 'exists' | 'expire' | 'mget' | 'set'>) => mock as Redis;

vi.mock('ioredis', () => ({
    default: RedisMock,
}));

describe('redis cache module', () => {
    it('throws on reserved cache ttl key', async () => {
        const redisCache = (await import('@/utils/cache/redis')).default;
        redisCache.status.available = true;
        redisCache.clients.redisClient = asRedisClient(new RedisMock());

        await expect(redisCache.get('rsshub:cacheTtl:bad')).rejects.toThrow('reserved for the internal usage');
    });

    it('expires cache ttl key when present', async () => {
        const redisCache = (await import('@/utils/cache/redis')).default;
        const client = new RedisMock();
        client.mget.mockResolvedValue(['value', '30']);
        client.exists.mockResolvedValue(true);
        redisCache.status.available = true;
        redisCache.clients.redisClient = asRedisClient(client);

        const value = await redisCache.get('mock', true);
        expect(value).toBe('value');
        expect(client.expire).toHaveBeenCalledWith('rsshub:cacheTtl:mock', '30');
        expect(client.expire).toHaveBeenCalledWith('mock', '30');

        await expect(redisCache.has('mock')).resolves.toBe(true);
        client.exists.mockResolvedValue(false);
        await expect(redisCache.has('missing')).resolves.toBe(false);
    });

    it('marks redis unavailable on error', async () => {
        const redisCache = (await import('@/utils/cache/redis')).default;
        redisCache.init();

        redisCache.clients.redisClient?.emit('error', new Error('boom'));

        expect(redisCache.status.available).toBe(false);
        expect(errorSpy).toHaveBeenCalled();
    });
});
