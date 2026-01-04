// Cloudflare Workers KV cache module

import type { KVNamespace } from '@cloudflare/workers-types';

import { config } from '@/config';

import type CacheModule from './base';

let kvNamespace: KVNamespace | null = null;

const status = { available: false };

const getCacheTtlKey = (key: string) => {
    if (key.startsWith('rsshub:cacheTtl:')) {
        throw new Error('"rsshub:cacheTtl:" prefix is reserved for the internal usage, please change your cache key');
    }
    return `rsshub:cacheTtl:${key}`;
};

export const setKVNamespace = (kv: KVNamespace) => {
    kvNamespace = kv;
    status.available = true;
};

export const getKVNamespace = () => kvNamespace;

export default {
    init: () => {
        // KV namespace is set via setKVNamespace from Worker env binding
    },
    get: async (key: string, refresh = true) => {
        if (key && status.available && kvNamespace) {
            const cacheTtlKey = getCacheTtlKey(key);
            const [value, cacheTtl] = await Promise.all([kvNamespace.get(key), kvNamespace.get(cacheTtlKey)]);

            if (value && refresh) {
                const ttl = cacheTtl ? Number.parseInt(cacheTtl, 10) : config.cache.contentExpire;
                // Refresh TTL by re-setting the value
                // KV doesn't have a native expire refresh, so we need to re-put
                // Use waitUntil pattern in production for non-blocking refresh
                await Promise.all([kvNamespace.put(key, value, { expirationTtl: ttl }), cacheTtl ? kvNamespace.put(cacheTtlKey, cacheTtl, { expirationTtl: ttl }) : Promise.resolve()]);
            }
            return value || '';
        } else {
            return null;
        }
    },
    set: async (key: string, value?: string | Record<string, any>, maxAge = config.cache.contentExpire) => {
        if (!status.available || !kvNamespace) {
            return;
        }
        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        if (key) {
            const promises: Array<Promise<void>> = [kvNamespace.put(key, value, { expirationTtl: maxAge })];

            if (maxAge !== config.cache.contentExpire) {
                // Store the cache ttl if it is not the default value
                promises.push(kvNamespace.put(getCacheTtlKey(key), String(maxAge), { expirationTtl: maxAge }));
            }

            await Promise.all(promises);
        }
    },
    clients: {},
    status,
} as CacheModule;
