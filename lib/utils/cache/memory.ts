import { LRUCache } from 'lru-cache';

import { config } from '@/config';

import type CacheModule from './base';

const status = { available: false };
const clients: {
    memoryCache?: LRUCache<any, any>;
} = {};

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
            let value = clients.memoryCache.get(key, { updateAgeOnGet: refresh }) as string | undefined;
            if (value) {
                value = value + '';
            }
            return value;
        } else {
            return null;
        }
    },
    set: (key, value, maxAge = config.cache.contentExpire) => {
        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        if (key && status.available && clients.memoryCache) {
            return clients.memoryCache.set(key, value, { ttl: maxAge * 1000 });
        }
    },
    clients,
    status,
} as CacheModule;
