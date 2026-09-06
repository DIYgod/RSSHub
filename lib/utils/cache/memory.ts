import { LRUCache } from 'lru-cache';

import { config } from '@/config';

import type CacheModule from './base';
import { stringify } from './base';

const status = { available: false };
const clients: CacheModule['clients'] = {};

export default {
    init: () => {
        clients.memoryCache = new LRUCache({
            ttl: config.cache.routeExpire * 1000,
            max: config.memory.max,
        });
        status.available = true;
    },
    get: (key: string, refresh = true) => {
        if (key && status.available && clients.memoryCache) {
            let value = clients.memoryCache.get(key, { updateAgeOnGet: refresh });
            if (value) {
                value += '';
            }
            return value ?? null;
        }
        return null;
    },
    has: (key: string) => {
        if (key && status.available && clients.memoryCache) {
            return clients.memoryCache.has(key);
        }
        return false;
    },
    set: <T>(key: string, value?: string | T, maxAge = config.cache.contentExpire) => {
        const stored = stringify(value);
        if (key && status.available && clients.memoryCache) {
            return clients.memoryCache.set(key, stored, { ttl: maxAge * 1000 });
        }
    },
    clients,
    status,
} satisfies CacheModule;
