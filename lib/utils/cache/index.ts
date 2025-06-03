import { config } from '@/config';
import redis from './redis';
import memory from './memory';
import type CacheModule from './base';
import logger from '@/utils/logger';

const globalCache: {
    get: (key: string) => Promise<string | null | undefined> | string | null | undefined;
    set: (key: string, value?: string | Record<string, any>, maxAge?: number) => any;
} = {
    get: () => null,
    set: () => null,
};

let cacheModule: CacheModule;

if (config.cache.type === 'redis') {
    cacheModule = redis;
    cacheModule.init();
    const { redisClient } = cacheModule.clients;
    globalCache.get = async (key) => {
        if (key && cacheModule.status.available && redisClient) {
            const value = await redisClient.get(key);
            return value;
        }
    };
    globalCache.set = cacheModule.set;
} else if (config.cache.type === 'memory') {
    cacheModule = memory;
    cacheModule.init();
    const { memoryCache } = cacheModule.clients;
    globalCache.get = (key) => {
        if (key && cacheModule.status.available && memoryCache) {
            return memoryCache.get(key, { updateAgeOnGet: false }) as string | undefined;
        }
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
} else {
    cacheModule = {
        init: () => null,
        get: () => null,
        set: () => null,
        status: {
            available: false,
        },
        clients: {},
    };
    logger.error('Cache not available, concurrent requests are not limited. This could lead to bad behavior.');
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
        } else {
            const value = await getValueFunc();
            cacheModule.set(key, value, maxAge);

            return value;
        }
    },
    globalCache,
};
