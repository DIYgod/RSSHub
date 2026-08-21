import { config } from '@/config';
import { isWorker } from '@/utils/is-worker';
import logger from '@/utils/logger';

import type CacheModule from './base';
import http from './http';
import memory from './memory';
import redis from './redis';

const globalCache: {
    get: (key: string) => Promise<string | null | undefined> | string | null | undefined;
    has: (key: string) => Promise<boolean> | boolean;
    set: (key: string, value?: string | Record<string, any>, maxAge?: number) => any;
    /**
     * Atomically set `key` to '1' and return true, unless it is already '1' (return false).
     * A get-then-set in the caller races: two same-tick requests would both read "not '1'".
     */
    claim: (key: string, maxAge: number) => Promise<boolean> | boolean;
} = {
    get: () => null,
    has: () => false,
    set: () => null,
    claim: () => true,
};

const noopCacheModule: CacheModule = {
    init: () => null,
    get: () => null,
    has: () => false,
    set: () => null,
    status: {
        available: false,
    },
    clients: {},
};

let cacheModule: CacheModule = noopCacheModule;

if (isWorker) {
    // No-op cache for Cloudflare Workers
    cacheModule = noopCacheModule;
} else {
    switch (config.cache.type) {
        case 'redis': {
            cacheModule = redis;
            cacheModule.init();
            const { redisClient } = cacheModule.clients;
            globalCache.get = async (key) => {
                if (!key || !cacheModule.status.available || !redisClient) {
                    return;
                }
                const value = await redisClient.get(key);
                return value;
            };
            globalCache.has = async (key) => {
                if (key && cacheModule.status.available && redisClient) {
                    const result = await redisClient.exists(key);
                    return result > 0;
                }
                return false;
            };
            globalCache.set = cacheModule.set;
            globalCache.claim = async (key, maxAge) => {
                if (!key || !cacheModule.status.available || !redisClient) {
                    return true;
                }
                const result = await redisClient.eval("if redis.call('GET', KEYS[1]) == '1' then return 0 end redis.call('SET', KEYS[1], '1', 'EX', ARGV[1]) return 1", 1, key, maxAge);
                return result === 1;
            };
            break;
        }
        case 'http':
            cacheModule = http;
            cacheModule.init();
            globalCache.get = (key) => {
                if (key && cacheModule.status.available) {
                    return cacheModule.get(key, false);
                }
            };
            globalCache.has = (key) => {
                if (key && cacheModule.status.available) {
                    return cacheModule.has(key);
                }
                return false;
            };
            globalCache.set = (key, value, maxAge = config.cache.routeExpire) => {
                if (key && cacheModule.status.available) {
                    return cacheModule.set(key, value, maxAge);
                }
            };
            globalCache.claim = async (key, maxAge) => {
                if (!key || !cacheModule.status.available) {
                    return true;
                }
                // best effort: the HTTP cache protocol has no atomic operation
                if ((await cacheModule.get(key, false)) === '1') {
                    return false;
                }
                await cacheModule.set(key, '1', maxAge);
                return true;
            };
            break;
        case 'memory': {
            cacheModule = memory;
            cacheModule.init();
            const { memoryCache } = cacheModule.clients;
            globalCache.get = (key) => {
                if (key && cacheModule.status.available && memoryCache) {
                    return memoryCache.get(key, { updateAgeOnGet: false }) as string | undefined;
                }
            };
            globalCache.has = (key) => {
                if (key && cacheModule.status.available && memoryCache) {
                    return memoryCache.has(key);
                }
                return false;
            };
            globalCache.set = (key, value, maxAge = config.cache.routeExpire) => {
                if (!value || value === 'undefined') {
                    value = '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                if (key && memoryCache) {
                    return memoryCache.set(key, value, { ttl: maxAge * 1000 });
                }
            };
            // fully synchronous, so nothing can interleave between the read and the write
            globalCache.claim = (key, maxAge) => {
                if (!key || !cacheModule.status.available || !memoryCache) {
                    return true;
                }
                if (memoryCache.get(key, { updateAgeOnGet: false }) === '1') {
                    return false;
                }
                memoryCache.set(key, '1', { ttl: maxAge * 1000 });
                return true;
            };
            break;
        }
        default:
            cacheModule = noopCacheModule;
            logger.error('Cache not available, concurrent requests are not limited. This could lead to bad behavior.');
    }
}

// only give cache string, as the `!` condition tricky
// md5 is used to shrink key size
// plz, write these tips in comments!
export default {
    ...cacheModule,
    /**
     * Try to get the cache. If the cache does not exist, the `getValueFunc` function will be called to get the data, and the data will be cached.
     * @param key The key used to store and retrieve the cache. You can use `:` as a separator to create a hierarchy.
     * @param getValueFunc A function that returns data to be cached when a cache miss occurs.
     * @param maxAge The maximum age of the cache in seconds. This should left to the default value in most cases which is `CACHE_CONTENT_EXPIRE`.
     * @param refresh Whether to renew the cache expiration time when the cache is hit. `true` by default.
     * @returns
     */
    tryGet: async <T extends string | Record<string, any>>(key: string, getValueFunc: () => Promise<T>, maxAge = config.cache.contentExpire, refresh = true) => {
        if (typeof key !== 'string') {
            throw new TypeError('Cache key must be a string');
        }
        let v = await cacheModule.get(key, refresh);
        if (v) {
            let parsed;
            try {
                parsed = JSON.parse(v);
            } catch {
                parsed = null;
            }
            if (parsed) {
                v = parsed;
            }

            return v as T;
        }
        const value = await getValueFunc();
        cacheModule.set(key, JSON.stringify(value), maxAge);

        return value;
    },
    globalCache,
};
