const Lru = require('lru-cache');
const md5 = require('@/utils/md5');
const config = require('@/config').value;
const logger = require('@/utils/logger');

let Redis;

module.exports = function (app) {
    let available = false;
    const globalCache = {
        get: null,
        set: null,
    };

    if (config.cache.type === 'redis') {
        Redis = Redis || require('ioredis');
        const redisClient = new Redis(config.redis.url);

        redisClient.on('error', (error) => {
            available = false;
            logger.error('Redis error: ', error);
        });
        redisClient.on('end', () => {
            available = false;
        });
        redisClient.on('connect', () => {
            available = true;
            logger.info('Redis connected.');
        });

        app.context.cache = {
            get: async (key, refresh = true) => {
                if (key && available) {
                    let value = await redisClient.get(key);
                    if (value && refresh) {
                        redisClient.expire(key, config.cache.contentExpire);
                        value = value + '';
                    }
                    return value;
                }
            },
            set(key, value, maxAge = config.cache.contentExpire) {
                if (!available) {
                    return;
                }
                if (!value || value === 'undefined') {
                    value = '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                if (key) {
                    redisClient.set(key, value, 'NX', 'EX', maxAge);
                }
            },
            client: redisClient,
            globalCache,
        };
        globalCache.get = async (key) => {
            if (key && available) {
                const value = await redisClient.get(key);
                return value;
            }
        };
        globalCache.set = app.context.cache.set;
    } else if (config.cache.type === 'memory') {
        const pageCache = new Lru({
            maxAge: config.cache.routeExpire * 1000,
            max: Infinity,
        });

        const routeCache = new Lru({
            maxAge: config.cache.routeExpire * 1000,
            max: Infinity,
            updateAgeOnGet: true,
        });

        app.context.cache = {
            get: (key, refresh = true) => {
                if (key && available) {
                    let value = (refresh ? routeCache : pageCache).get(key);
                    if (value) {
                        value = value + '';
                    }
                    return value;
                }
            },
            set: (key, value, maxAge = config.cache.contentExpire, refresh = true) => {
                if (!value || value === 'undefined') {
                    value = '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                if (key && available) {
                    return (refresh ? routeCache : pageCache).set(key, value, maxAge * 1000);
                }
            },
            client: [pageCache, routeCache],
            globalCache,
        };
        globalCache.get = (key) => {
            if (key && available) {
                return pageCache.get(key);
            }
        };
        globalCache.set = (key, value, maxAge) => {
            if (!value || value === 'undefined') {
                value = '';
            }
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            if (key) {
                return pageCache.set(key, value, maxAge * 1000);
            }
        };
        available = true;
    } else {
        app.context.cache = {
            get: () => null,
            set: () => null,
        };
    }

    app.context.cache.tryGet = async function (key, getValueFunc, maxAge = config.cache.contentExpire) {
        let v = await this.get(key);
        if (!v) {
            v = await getValueFunc();
            this.set(key, v, maxAge);
        } else {
            let parsed;
            try {
                parsed = JSON.parse(v);
            } catch (e) {
                parsed = null;
            }
            if (parsed) {
                v = parsed;
            }
        }

        return v;
    };

    return async function cache(ctx, next) {
        const key = 'koa-redis-cache:' + md5(ctx.request.path);

        if (!available) {
            return next();
        }

        try {
            const value = await globalCache.get(key);

            if (value) {
                ctx.response.status = 200;
                if (config.cache.type === 'redis') {
                    ctx.response.set({
                        'X-Koa-Redis-Cache': 'true',
                    });
                } else if (config.cache.type === 'memory') {
                    ctx.response.set({
                        'X-Koa-Memory-Cache': 'true',
                    });
                }
                ctx.state.data = JSON.parse(value);
                return;
            }
        } catch (e) {
            //
        }

        await next();

        if (ctx.response.get('Cache-Control') !== 'no-cache' && ctx.state && ctx.state.data) {
            ctx.state.data.lastBuildDate = new Date().toUTCString();
            const body = JSON.stringify(ctx.state.data);
            await globalCache.set(key, body, config.cache.routeExpire);
        }
    };
};
