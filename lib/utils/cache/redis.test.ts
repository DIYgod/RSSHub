import { describe, expect, it, vi } from 'vitest';

const errorSpy = vi.fn();
const infoSpy = vi.fn();

vi.mock('@/utils/logger', () => ({
    default: {
        error: errorSpy,
        info: infoSpy,
    },
}));

class RedisMock extends EventTarget {
    mget = vi.fn();
    expire = vi.fn();
    set = vi.fn();

    on(event: string, listener: (...args: any[]) => void) {
        this.addEventListener(event, (evt) => {
            listener((evt as Event & { detail?: unknown }).detail);
        });
        return this;
    }

    emit(event: string, detail?: unknown) {
        const evt = new Event(event) as Event & { detail?: unknown };
        evt.detail = detail;
        this.dispatchEvent(evt);
        return true;
    }
}

vi.mock('ioredis', () => ({
    default: RedisMock,
}));

describe('redis cache module', () => {
    it('throws on reserved cache ttl key', async () => {
        const redisCache = (await import('@/utils/cache/redis')).default;
        redisCache.status.available = true;
        redisCache.clients.redisClient = new RedisMock() as any;

        await expect(redisCache.get('rsshub:cacheTtl:bad')).rejects.toThrow('reserved for the internal usage');
    });

    it('expires cache ttl key when present', async () => {
        const redisCache = (await import('@/utils/cache/redis')).default;
        const client = new RedisMock() as any;
        client.mget.mockResolvedValue(['value', '30']);
        redisCache.status.available = true;
        redisCache.clients.redisClient = client;

        const value = await redisCache.get('mock', true);
        expect(value).toBe('value');
        expect(client.expire).toHaveBeenCalledWith('rsshub:cacheTtl:mock', '30');
        expect(client.expire).toHaveBeenCalledWith('mock', '30');
    });

    it('marks redis unavailable on error', async () => {
        const redisCache = (await import('@/utils/cache/redis')).default;
        redisCache.init();
        const client = redisCache.clients.redisClient as RedisMock;

        client.emit('error', new Error('boom'));

        expect(redisCache.status.available).toBe(false);
        expect(errorSpy).toHaveBeenCalled();
    });
});
