// Worker-specific cache module - KV-based implementation
// This file is used instead of index.ts when building for Cloudflare Workers

import { config } from '@/config';

import type CacheModule from './base';
import { stringify } from './base';
import kv, { getKVNamespace } from './kv';

// Re-export setKVNamespace for use in app.worker.tsx

type GlobalCache = {
    get: (key: string) => Promise<string | null | undefined> | string | null | undefined;
    set: <T>(key: string, value?: string | T, maxAge?: number) => any;
    /**
     * Atomically set `key` to '1' and return true, unless it is already '1' (return false).
     * A get-then-set in the caller races: two same-tick requests would both read "not '1'".
     */
    claim: (key: string, maxAge: number) => Promise<boolean> | boolean;
};

const globalCache: GlobalCache = {
    get: async (key) => {
        if (key && kv.status.available && getKVNamespace()) {
            const value = await getKVNamespace()!.get(key);
            return value;
        }
        return null;
    },
    set: async (key, value, maxAge = config.cache.routeExpire) => {
        if (!kv.status.available || !getKVNamespace()) {
            return;
        }
        const stored = stringify(value);
        if (key) {
            await getKVNamespace()!.put(key, stored, { expirationTtl: maxAge });
        }
    },
    claim: async (key, maxAge) => {
        // best effort: KV has no atomic operation
        if ((await globalCache.get(key)) === '1') {
            return false;
        }
        await globalCache.set(key, '1', maxAge);
        return true;
    },
};

// Use KV cache module for Worker
const cacheModule: CacheModule = kv;

export default {
    ...cacheModule,
    get status() {
        return kv.status;
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
        // Use KV cache if available
        if (kv.status.available) {
            let v = await kv.get(key, refresh);
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
            kv.set(key, value, maxAge);
            return value;
        }
        // Fallback: always call getValueFunc if KV is not available
        const value = await getValueFunc();
        return value;
    },
    globalCache,
};

export { setKVNamespace } from './kv';
