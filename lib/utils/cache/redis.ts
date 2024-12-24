import { config } from '@/config';
import Redis from 'ioredis';
import logger from '@/utils/logger';
import type CacheModule from './base';

const status = { available: false };
const clients: {
    redisClient?: Redis;
} = {};

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
                value = value + '';
            }
            return value || '';
        } else {
            return null;
        }
    },
    set: (key: string, value?: string | Record<string, any>, maxAge = config.cache.contentExpire) => {
        if (!status.available || !clients.redisClient) {
            return;
        }
        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        if (key) {
            if (maxAge !== config.cache.contentExpire) {
                // intentionally store the cache ttl if it is not the default value
                clients.redisClient.set(getCacheTtlKey(key), maxAge, 'EX', maxAge);
            }
            return clients.redisClient.set(key, value, 'EX', maxAge); // setMode: https://redis.io/commands/set
        }
    },
    clients,
    status,
} as CacheModule;
