import { get as getConfig } from '@/config/index.js';
const config = getConfig();
import Redis from 'ioredis';
import logger from '@/lib/utils/logger.js';

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

export default {
    get: async (key, refresh = true) => {
        if (key && status.available) {
            let value = await redisClient.get(key);
            if (value && refresh) {
                redisClient.expire(key, config.cache.contentExpire);
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
            return redisClient.set(key, value, 'EX', maxAge); // setMode: https://redis.io/commands/set
        }
    },
    clients: { redisClient },
    status,
};
