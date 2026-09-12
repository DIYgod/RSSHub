// Worker-specific cache module - HTTP cache when configured, KV by default
// This file is used instead of index.ts when building for Cloudflare Workers

import { config } from '@/config';

import type CacheModule from './base';
import { stringify } from './base';
import http from './http';
import kv, { getKVNamespace } from './kv';

const cacheModule: CacheModule = config.cache.type === 'http' ? http : kv;

if (cacheModule === http) {
    cacheModule.init();
}

type GlobalCache = {
    supportsAtomicClaims: boolean;
    get: (key: string) => Promise<string | null | undefined> | string | null | undefined;
    has: (key: string) => Promise<boolean> | boolean;
    set: <T>(key: string, value?: string | T, maxAge?: number) => any;
    /**
     * Atomically set `key` to '1' and return true, unless it is already '1' (return false).
     * A get-then-set in the caller races: two same-tick requests would both read "not '1'".
     */
    claim: (key: string, maxAge: number) => Promise<boolean> | boolean;
};

const globalCache: GlobalCache = {
    // HTTP and KV reads can be stale, so neither can coordinate request locks.
    supportsAtomicClaims: false,
    get: async (key) => {
        if (cacheModule === http) {
            if (key && cacheModule.status.available) {
                return cacheModule.get(key, false);
            }
            return;
        }
        if (key && kv.status.available && getKVNamespace()) {
            const value = await getKVNamespace()!.get(key);
            return value;
        }
        return null;
    },
    has: cacheModule.has,
    set: async (key, value, maxAge = config.cache.routeExpire) => {
        if (cacheModule === http) {
            if (key && cacheModule.status.available) {
                await cacheModule.set(key, value, maxAge);
            }
            return;
        }
        if (!kv.status.available || !getKVNamespace()) {
            return;
        }
        const stored = stringify(value);
        if (key) {
            await getKVNamespace()!.put(key, stored, { expirationTtl: maxAge });
        }
    },
    claim: async (key, maxAge) => {
        if (!key || !cacheModule.status.available) {
            return true;
        }
        // Best effort: neither KV nor the HTTP cache protocol has an atomic operation.
        if ((await globalCache.get(key)) === '1') {
            return false;
        }
        await globalCache.set(key, '1', maxAge);
        return true;
    },
};

export default {
    ...cacheModule,
    get status() {
        return cacheModule.status;
    },
    /**
     * Try to get the cache. If the cache does not exist, the `getValueFunc` function will be called to get the data, and the data will be cached.
     * @param key The key used to store and retrieve the cache. You can use `:` as a separator to create a hierarchy.
     * @param getValueFunc A function that returns data to be cached when a cache miss occurs.
     * @param maxAge The maximum age of the cache in seconds. This should left to the default value in most cases which is `CACHE_CONTENT_EXPIRE`.
     * @param refresh Whether to renew the cache expiration time when the cache is hit. `true` by default.
     * @returns
     */
    tryGet: async <T>(key: string, getValueFunc: () => Promise<T>, maxAge = config.cache.contentExpire, refresh = true) => {
        if (typeof key !== 'string') {
            throw new TypeError('Cache key must be a string');
        }
        if (cacheModule.status.available) {
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
            await cacheModule.set(key, value, maxAge);
            return value;
        }
        // Fallback: always call getValueFunc if the cache is not available.
        const value = await getValueFunc();
        return value;
    },
    globalCache,
};

export { setKVNamespace } from './kv';
