const md5 = require('@/utils/md5');
const config = require('@/config').value;
const logger = require('@/utils/logger');
const { RequestInProgressError } = require('@/errors');

const globalCache = {
    get: () => null,
    set: () => null,
};

let cacheModule = {
    get: () => null,
    set: () => null,
    status: { available: false },
    clients: {},
};

if (config.cache.type === 'redis') {
    cacheModule = require('./redis');
    const { redisClient } = cacheModule.clients;
    globalCache.get = async (key) => {
        if (key && cacheModule.status.available) {
            const value = await redisClient.get(key);
            return value;
        }
    };
    globalCache.set = cacheModule.set;
} else if (config.cache.type === 'memory') {
    cacheModule = require('./memory');
    const { memoryCache } = cacheModule.clients;
    globalCache.get = (key) => {
        if (key && cacheModule.status.available) {
            return memoryCache.get(key, { updateAgeOnGet: false });
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
            return memoryCache.set(key, value, { ttl: maxAge * 1000 });
        }
    };
} else {
    logger.error('Cache not available, concurrent requests are not limited. This could lead to bad behavior.');
}

// only give cache string, as the `!` condition tricky
// md5 is used to shrink key size
// plz, write these tips in comments!
module.exports = function (app) {
    const { get, set, status } = cacheModule;
    app.context.cache = {
        ...cacheModule,
        tryGet: async (key, getValueFunc, maxAge = config.cache.contentExpire, refresh = true) => {
            let v = await get(key, refresh);
            if (!v) {
                v = await getValueFunc();
                set(key, v, maxAge);
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
        },
        globalCache,
    };

    return async (ctx, next) => {
        const key = 'koa-redis-cache:' + md5(ctx.request.path);
        const controlKey = 'path-requested:' + md5(ctx.request.path);

        if (!status.available) {
            return next();
        }

        const isRequesting = await globalCache.get(controlKey);

        if (isRequesting === '1') {
            throw new RequestInProgressError('This path is currently fetching, please come back later!');
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

        // Doesn't hit the cache? We need to let others know!
        await globalCache.set(controlKey, '1', config.cache.requestTimeout);

        try {
            await next();
        } catch (e) {
            await globalCache.set(controlKey, '0', config.cache.requestTimeout);
            throw e;
        }

        if (ctx.response.get('Cache-Control') !== 'no-cache' && ctx.state && ctx.state.data) {
            ctx.state.data.lastBuildDate = new Date().toUTCString();
            const body = JSON.stringify(ctx.state.data);
            await globalCache.set(key, body, config.cache.routeExpire);
        }

        // We need to let it go, even no cache set.
        // Wait to set cache so the next request could be handled correctly
        await globalCache.set(controlKey, '0', config.cache.requestTimeout);
    };
};
