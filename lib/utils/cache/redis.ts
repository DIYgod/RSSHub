import Redis from 'ioredis';

import { config } from '@/config';
import logger from '@/utils/logger';

import type CacheModule from './base';
import { stringify } from './base';

const status = { available: false };
const clients: CacheModule['clients'] = {};

const getCacheTtlKey = (key: string) => {
    if (key.startsWith('rsshub:cacheTtl:')) {
        throw new Error('"rsshub:cacheTtl:" prefix is reserved for the internal usage, please change your cache key'); // blocking any attempt to get/set the cacheTtl
    }
    return `rsshub:cacheTtl:${key}`;
};

export default {
    init: () => {
        clients.redisClient = new Redis(config.redis.url);

        clients.redisClient.on('error', (error) => {
            status.available = false;
            logger.error('Redis error: ', error);
        });
        clients.redisClient.on('end', () => {
            status.available = false;
        });
        clients.redisClient.on('connect', () => {
            status.available = true;
            logger.info('Redis connected.');
        });
    },
    get: async (key: string, refresh = true) => {
        if (key && status.available && clients.redisClient) {
            const cacheTtlKey = getCacheTtlKey(key);
            let [value, cacheTtl] = await clients.redisClient.mget(key, cacheTtlKey);
            if (value && refresh) {
                if (cacheTtl) {
                    clients.redisClient.expire(cacheTtlKey, cacheTtl);
                } else {
                    // if cacheTtl is not set, that means the cache expire time is contentExpire
                    cacheTtl = config.cache.contentExpire + '';
                    // dont save cacheTtl to Redis, as it is the default value
                    // redisClient.set(cacheTtlKey, cacheTtl, 'EX', cacheTtl);
                }
                clients.redisClient.expire(key, cacheTtl);
                value += '';
            }
            return value || '';
        }
        return null;
    },
    has: async (key: string) => {
        if (key && status.available && clients.redisClient) {
            const result = await clients.redisClient.exists(key);
            return result > 0;
        }
        return false;
    },
    set: <T>(key: string, value?: string | T, maxAge = config.cache.contentExpire) => {
        if (!status.available || !clients.redisClient) {
            return;
        }
        const stored = stringify(value);
        if (key) {
            if (maxAge !== config.cache.contentExpire) {
                // intentionally store the cache ttl if it is not the default value
                clients.redisClient.set(getCacheTtlKey(key), maxAge, 'EX', maxAge);
            }
            return clients.redisClient.set(key, stored, 'EX', maxAge); // setMode: https://redis.io/commands/set
        }
    },
    clients,
    status,
} satisfies CacheModule;
