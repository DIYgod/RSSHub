import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ type: 'memory', values: new Map<string, string>(), eval: vi.fn() }));
vi.mock('../lib/config', () => ({
    config: {
        cache: {
            get type() {
                return state.type;
            },
            routeExpire: 300,
            contentExpire: 600,
        },
        memory: { max: 100 },
    },
}));
vi.mock('../lib/utils/logger', () => ({ default: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../lib/utils/cache/redis', () => ({
    default: {
        init: vi.fn(),
        status: { available: true },
        get: vi.fn(),
        has: vi.fn(),
        set: (key: string, value: string) => state.values.set(key, value),
        clients: { redisClient: { get: (key: string) => state.values.get(key), exists: (key: string) => Number(state.values.has(key)), eval: state.eval } },
    },
}));

beforeEach(() => {
    vi.resetModules();
    state.values.clear();
    state.eval.mockReset().mockImplementation((_script, _numberOfKeys, key: string) => {
        if (state.values.get(key) === '1') {
            return 0;
        }
        state.values.set(key, '1');
        return 1;
    });
});

describe('atomic cache backends', () => {
    it.each(['memory', 'redis'])('retains atomic claims and release for %s', async (backend) => {
        state.type = backend;
        const cache = (await import('../lib/utils/cache/index')).default;

        expect(cache.globalCache.supportsAtomicClaims).toBe(true);
        expect(await Promise.all([cache.globalCache.claim('same-request', 60), cache.globalCache.claim('same-request', 60)])).toEqual([true, false]);
        await cache.globalCache.set('same-request', '0', 60);
        expect(await cache.globalCache.claim('same-request', 60)).toBe(true);

        if (backend === 'redis') {
            expect(state.eval).toHaveBeenCalledTimes(3);
            expect(state.eval).toHaveBeenCalledWith(expect.stringContaining("redis.call('GET', KEYS[1])"), 1, 'same-request', 60);
        }
    });
});
