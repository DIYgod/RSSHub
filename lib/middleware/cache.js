const wrapper = require('co-redis');
const Redis = require('redis');
const Lru = require('lru-cache');
const md5 = require('../utils/md5');
const config = require('../config');
const logger = require('../utils/logger');
const pathToRegExp = require('path-to-regexp');

module.exports = function(app, options = {}) {
    let available = false;

    const { prefix = 'koa-redis-cache:', expire = config.cacheExpire, routes = ['(.*)'], exclude = ['/'], passParam = '', maxLength = Infinity, ignoreQuery = true } = options;

    const globalCache = {
        get: null,
        set: null,
    };
    if (config.cacheType === 'redis') {
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
            get: async (key) => {
                if (key) {
                    const value = await redisClient.get(key);
                    if (value) {
                        await redisClient.expire(key, 24 * 60 * 60);
                    }
                    return value;
                }
            },
            set: async (key, value, maxAge = 24 * 60 * 60) => {
                if (!value || value === 'undefined') {
                    value = '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                if (key) {
                    await redisClient.setex(key, maxAge, value);
                }
            },
        };
        globalCache.get = async (key) => {
            if (key) {
                const value = await redisClient.get(key);
                return value;
            }
        };
        globalCache.set = app.context.cache.set;
    } else if (config.cacheType === 'memory') {
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
            get: (key) => {
                if (key) {
                    return routeCache.get(key);
                }
            },
            set: (key, value, maxAge = 24 * 60 * 60) => {
                if (!value || value === 'undefined') {
                    value = '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                if (key) {
                    return routeCache.set(key, value, maxAge * 1000);
                }
            },
        };
        globalCache.get = (key) => {
            if (key) {
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

    app.context.cache.tryGet = async function(key, getValueFunc, maxAge = 24 * 60 * 60) {
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

    async function getCache(ctx, key, tkey) {
        const value = await globalCache.get(key);
        let type;
        let ok = false;

        if (value) {
            ctx.response.status = 200;
            type = (await globalCache.get(tkey)) || 'text/html';
            // can happen if user specified return_buffers: true in redis options
            if (Buffer.isBuffer(type)) {
                type = type.toString();
            }
            if (config.cacheType === 'redis') {
                ctx.response.set({
                    'X-Koa-Redis-Cache': 'true',
                    'Content-Type': type,
                });
            } else if (config.cacheType === 'memory') {
                ctx.response.set({
                    'X-Koa-Memory-Cache': 'true',
                    'Content-Type': type,
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

    async function setCache(ctx, key, tkey, expire) {
        ctx.state.data.lastBuildDate = new Date().toUTCString();
        const body = JSON.stringify(ctx.state.data);

        if (ctx.request.method !== 'GET' || !body) {
            return;
        }
        if (Buffer.byteLength(body) > maxLength) {
            return;
        }
        await globalCache.set(key, body, expire);

        const type = ctx.response.headers['content-type'];
        if (type) {
            await globalCache.set(tkey, type, expire);
        }
    }

    return async function cache(ctx, next) {
        const { url, path } = ctx.request;
        const resolvedPrefix = typeof prefix === 'function' ? prefix.call(ctx, ctx) : prefix;
        const key = resolvedPrefix + md5(ignoreQuery ? path : url);
        const tkey = key + ':type';

        const validityCheck = (routes, exclude, path) => {
            let match = false;
            let routeExpire = false;

            const paired = (route, path) => {
                const options = {
                    sensitive: true,
                    strict: true,
                };
                return pathToRegExp(route, [], options).exec(path);
            };

            for (let i = 0; i < routes.length; i++) {
                let route = routes[i];
                if (typeof routes[i] === 'object') {
                    route = routes[i].path;
                    routeExpire = routes[i].expire;
                }
                if (paired(route, path)) {
                    match = true;
                    break;
                }
            }

            for (let j = 0; j < exclude.length; j++) {
                if (paired(exclude[j], path)) {
                    match = false;
                    break;
                }
            }

            return { match, routeExpire };
        };

        const validity = validityCheck(routes, exclude, path);
        const match = validity.match;
        let routeExpire = validity.routeExpire;

        if (!available || !match || (passParam && ctx.request.query[passParam])) {
            return await next();
        }

        let ok = false;
        try {
            ok = await getCache(ctx, key, tkey);
        } catch (e) {
            ok = false;
        }
        if (ok) {
            return;
        }

        await next();

        try {
            const trueExpire = routeExpire || expire;
            await setCache(ctx, key, tkey, trueExpire);
        } catch (e) {
            //
        }
        routeExpire = false;
    };
};
