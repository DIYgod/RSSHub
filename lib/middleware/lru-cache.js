// based on https://github.com/coderhaoxin/koa-redis-cache

const lru = require('lru-cache');
const common = require('./cache-common');

module.exports = function(options = {}) {
    const {
        prefix = 'koa-cache:',
        expire = 30 * 60, // 30 min
        routes = ['(.*)'],
        exclude = ['/'],
        passParam = '',
        maxLength = Infinity,
        ignoreQuery = false,
    } = options;

    const memoryCache = new lru({
        maxAge: expire * 1000,
        max: maxLength,
    });

    options.app.context.cache = {
        get: (key) => {
            if (key) {
                return memoryCache.get(key);
            }
        },
        set: (key, value, maxAge) => {
            if (!value || value === 'undefined') {
                value = '';
            }
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            if (key) {
                memoryCache.set(key, value, maxAge * 1000);
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

        if (!match || (passParam && ctx.request.query[passParam])) {
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
        const value = memoryCache.get(key);
        let type;
        let ok = false;

        if (value) {
            ctx.response.status = 200;
            type = memoryCache.get(tkey) || 'text/html';
            // can happen if user specified return_buffers: true in redis options
            if (Buffer.isBuffer(type)) {
                type = type.toString();
            }
            ctx.response.set({
                'X-Koa-Memory-Cache': 'true',
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
    async function setCache(ctx, key, tkey) {
        ctx.state.data.lastBuildDate = new Date().toUTCString();
        const body = JSON.stringify(ctx.state.data);

        if (ctx.request.method !== 'GET' || !body) {
            return;
        }
        if (Buffer.byteLength(body) > maxLength) {
            return;
        }
        memoryCache.set(key, body);

        await cacheType(ctx, tkey);
    }

    /**
     * cacheType
     */
    async function cacheType(ctx, tkey) {
        const type = ctx.response.headers['content-type'];
        if (type) {
            memoryCache.set(tkey, type);
        }
    }
};
