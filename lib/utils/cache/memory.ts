import { LRUCache } from 'lru-cache';
import { config } from '@/config';
import type CacheModule from './base';

const status = { available: false };

let memoryCache: LRUCache<{}, {}>;

export default {
    init: () => {
        memoryCache = new LRUCache({
            ttl: config.cache.routeExpire * 1000,
            max: config.memory.max,
        });
        status.available = true;
    },
    get: (key: string, refresh = true) => {
        if (key && status.available) {
            let value = memoryCache.get(key, { updateAgeOnGet: refresh }) as string | undefined;
            if (value) {
                value = value + '';
            }
            return value;
        }
    },
    set: (key, value, maxAge = config.cache.contentExpire) => {
        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        if (key && status.available) {
            return memoryCache.set(key, value, { ttl: maxAge * 1000 });
        }
    },
    clients: { memoryCache },
    status,
} as CacheModule;
