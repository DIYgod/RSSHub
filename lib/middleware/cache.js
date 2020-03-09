const wrapper = require('co-redis');
const Redis = require('redis');
const Lru = require('lru-cache');
const md5 = require('@/utils/md5');
const config = require('@/config').value;
const logger = require('@/utils/logger');

module.exports = function(app, options = {}) {
    let available = false;

    const { prefix = 'koa-redis-cache:', expire = config.cache.routeExpire, passParam = '', maxLength = Infinity, ignoreQuery = true } = options;

    const globalCache = {
        get: null,
        set: null,
    };
    if (config.cache.type === 'redis') {
        const { host: redisHost = 'localhost', port: redisPort = 6379, url: redisUrl = `redis://${redisHost}:${redisPort}/`, options: redisOptions = {} } = config.redis || {};
        if (!redisOptions.password) {
            delete redisOptions.password;
        }
        const redisClient = wrapper(Redis.createClient(redisUrl, redisOptions));
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
            set: function(key, value, maxAge = config.cache.contentExpire) {
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
                    redisClient.setex(key, maxAge, value);
                }
            },
            client: redisClient,
            globalCache: globalCache,
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
            maxAge: expire * 1000,
            max: maxLength,
        });

        const routeCache = new Lru({
            maxAge: expire * 1000,
            max: maxLength,
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
            globalCache: globalCache,
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

    app.context.cache.tryGet = async function(key, getValueFunc, maxAge = config.cache.contentExpire) {
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

    async function getCache(ctx, key) {
        const value = await globalCache.get(key);
        let ok = false;

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
            try {
                ctx.state.data = JSON.parse(value);
            } catch (e) {
                ctx.state.data = {};
            }
            ok = true;
        }

        return ok;
    }

    async function setCache(ctx, key, expire) {
        if (ctx.response.get('Cache-Control') !== 'no-cache' && ctx.state && ctx.state.data) {
            ctx.state.data.lastBuildDate = new Date().toUTCString();
            const body = JSON.stringify(ctx.state.data);
            await globalCache.set(key, body, expire);
        }
    }

    return async function cache(ctx, next) {
        const { url, path } = ctx.request;
        const resolvedPrefix = typeof prefix === 'function' ? prefix.call(ctx, ctx) : prefix;
        const key = resolvedPrefix + md5(ignoreQuery ? path : url);

        if (!available || (passParam && ctx.request.query[passParam])) {
            return await next();
        }

        let ok = false;
        try {
            ok = await getCache(ctx, key);
        } catch (e) {
            ok = false;
        }
        if (ok) {
            return;
        }

        await next();

        try {
            const trueExpire = expire;
            setCache(ctx, key, trueExpire);
        } catch (e) {
            //
        }
    };
};
