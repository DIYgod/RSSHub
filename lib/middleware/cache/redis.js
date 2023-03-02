const config = require('@/config').value;
const Redis = require('ioredis');
const logger = require('@/utils/logger');

const redisClient = new Redis(config.redis.url);

const status = { available: false };

redisClient.on('error', (error) => {
    status.available = false;
    logger.error('Redis error: ', error);
});
redisClient.on('end', () => {
    status.available = false;
});
redisClient.on('connect', () => {
    status.available = true;
    logger.info('Redis connected.');
});

const getCacheTtlKey = (key) => {
    if (key.startsWith('cacheTtl:')) {
        throw Error('"cacheTtl:" prefix is reserved for the internal usage, please change your cache key'); // blocking any attempt to get/set the cacheTtl
    }
    return `cacheTtl:${key}`;
};

module.exports = {
    get: async (key, refresh = true) => {
        if (key && status.available) {
            const cacheTtlKey = getCacheTtlKey(key);
            let [value, cacheTtl] = await redisClient.mget(key, cacheTtlKey);
            if (value && refresh) {
                if (!cacheTtl) {
                    // if cacheTtl is not set, that means the cache expire time is contentExpire
                    cacheTtl = config.cache.contentExpire;
                    // dont save cacheTtl to Redis, as it is the default value
                    // redisClient.set(cacheTtlKey, cacheTtl, 'EX', cacheTtl);
                } else {
                    redisClient.expire(cacheTtlKey, cacheTtl);
                }
                redisClient.expire(key, cacheTtl);
                value = value + '';
            }
            return value;
        }
    },
    set: (key, value, maxAge = config.cache.contentExpire) => {
        if (!status.available) {
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
                // Only set cacheTtlKey if maxAge !== contentExpire
                redisClient.set(getCacheTtlKey(key), maxAge, 'EX', maxAge);
            }
            return redisClient.set(key, value, 'EX', maxAge); // setMode: https://redis.io/commands/set
        }
    },
    clients: { redisClient },
    status,
};
