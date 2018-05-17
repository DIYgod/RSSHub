// baed on https://github.com/coderhaoxin/koa-redis-cache

const pathToRegExp = require('path-to-regexp');
const wrapper = require('co-redis');
const readall = require('readall');
const crypto = require('crypto');
const Redis = require('redis');

module.exports = function(options = {}) {
    let redisAvailable = false;

    const {
        prefix = 'koa-redis-cache:',
        expire = 30 * 60, // 30 min
        routes = ['(.*)'],
        exclude = [],
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

    return async function cache(ctx, next) {
        const { url, path } = ctx.request;
        const resolvedPrefix = typeof prefix === 'function' ? prefix.call(ctx, ctx) : prefix;
        const key = resolvedPrefix + md5(ignoreQuery ? path : url);
        const tkey = key + ':type';
        let match = false;
        let routeExpire = false;

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
            ctx.response.set('X-Koa-Redis-Cache', 'true');
            ctx.response.type = type;
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
        const type = ctx.response.type;
        if (type) {
            await redisClient.setex(tkey, expire, type);
        }
    }
};

function paired(route, path) {
    const options = {
        sensitive: true,
        strict: true,
    };

    return pathToRegExp(route, [], options).exec(path);
}

// eslint-disable-next-line no-unused-vars
function read(stream) {
    return new Promise((resolve, reject) => {
        readall(stream, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function md5(str) {
    return crypto
        .createHash('md5')
        .update(str)
        .digest('hex');
}
