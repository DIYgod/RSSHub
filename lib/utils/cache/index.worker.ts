// Worker-specific cache module - no-op implementation
// This file is used instead of index.ts when building for Cloudflare Workers

import { config } from '@/config';

import type CacheModule from './base';

const globalCache: {
    get: (key: string) => Promise<string | null | undefined> | string | null | undefined;
    set: (key: string, value?: string | Record<string, any>, maxAge?: number) => any;
} = {
    get: () => null,
    set: () => null,
};

// No-op cache module for Worker
const cacheModule: CacheModule = {
    init: () => null,
    get: () => null,
    set: () => null,
    status: {
        available: false,
    },
    clients: {},
};

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
    tryGet: async <T extends string | Record<string, any>>(key: string, getValueFunc: () => Promise<T>, _maxAge = config.cache.contentExpire, _refresh = true) => {
        if (typeof key !== 'string') {
            throw new TypeError('Cache key must be a string');
        }
        // In Worker environment, always call getValueFunc since cache is not available
        const value = await getValueFunc();
        return value;
    },
    globalCache,
};
