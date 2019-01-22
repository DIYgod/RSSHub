// based on https://github.com/coderhaoxin/koa-redis-cache

const wrapper = require('co-redis');
const Redis = require('redis');
const common = require('./cache-common');

module.exports = function(options = {}) {
    let redisAvailable = false;

    const {
        prefix = 'koa-redis-cache:',
        expire = 30 * 60, // 30 min
        routes = ['(.*)'],
        exclude = ['/'],
        passParam = '',
        maxLength = Infinity,
        ignoreQuery = false,
        onerror = function() {},
        onconnect = function() {},
    } = options;

    const { host: redisHost = 'localhost', port: redisPort = 6379, url: redisUrl = `redis://${redisHost}:${redisPort}/`, options: redisOptions = {} } = options.redis || {};

    /**
     * redisClient
     */
    if (!redisOptions.password) {
        delete redisOptions.password;
    }
    const redisClient = wrapper(Redis.createClient(redisUrl, redisOptions));
    redisClient.on('error', (error) => {
        redisAvailable = false;
        onerror(error);
    });
    redisClient.on('end', () => {
        redisAvailable = false;
    });
    redisClient.on('connect', () => {
        redisAvailable = true;
        onconnect();
    });

    options.app.context.cache = {
        get: async (key) => {
            if (key) {
                return await redisClient.get(key);
            }
        },
        set: async (key, value, maxAge) => {
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

    return async function cache(ctx, next) {
        const { url, path } = ctx.request;
        const resolvedPrefix = typeof prefix === 'function' ? prefix.call(ctx, ctx) : prefix;
        const key = resolvedPrefix + common.md5(ignoreQuery ? path : url);
        const tkey = key + ':type';

        const validityCheck = common.validityCheck(routes, exclude, path);
        const match = validityCheck.match;
        let routeExpire = validityCheck.routeExpire;

        if (!redisAvailable || !match || (passParam && ctx.request.query[passParam])) {
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
        } catch (e) {} // eslint-disable-line no-empty
        routeExpire = false;
    };

    /**
     * getCache
     */
    async function getCache(ctx, key, tkey) {
        const value = await redisClient.get(key);
        let type;
        let ok = false;

        if (value) {
            ctx.response.status = 200;
            type = (await redisClient.get(tkey)) || 'text/html';
            // can happen if user specified return_buffers: true in redis options
            if (Buffer.isBuffer(type)) {
                type = type.toString();
            }
            ctx.response.set({
                'X-Koa-Redis-Cache': 'true',
                'Content-Type': type,
            });
            try {
                ctx.state.data = JSON.parse(value);
            } catch (e) {
                ctx.state.data = {};
            }
            ok = true;
        }

        return ok;
    }

    /**
     * setCache
     */
    async function setCache(ctx, key, tkey, expire) {
        ctx.state.data.lastBuildDate = new Date().toUTCString();
        const body = JSON.stringify(ctx.state.data);

        if (ctx.request.method !== 'GET' || !body) {
            return;
        }
        if (Buffer.byteLength(body) > maxLength) {
            return;
        }
        await redisClient.setex(key, expire, body);

        await cacheType(ctx, tkey, expire);
    }

    /**
     * cacheType
     */
    async function cacheType(ctx, tkey, expire) {
        const type = ctx.response.headers['content-type'];
        if (type) {
            await redisClient.setex(tkey, expire, type);
        }
    }
};
