import xxhash from 'xxhash-wasm';
import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import RequestInProgressError from '@/errors/request-in-progress';
import cacheModule from '@/utils/cache/index';
import { Data } from '@/types';

// only give cache string, as the `!` condition tricky
// md5 is used to shrink key size
// plz, write these tips in comments!
const middleware: MiddlewareHandler = async (ctx, next) => {
    const { h64ToString } = await xxhash();
    const key = 'rsshub:koa-redis-cache:' + h64ToString(ctx.req.path);
    const controlKey = 'rsshub:path-requested:' + h64ToString(ctx.req.path);

    if (!cacheModule.status.available) {
        await next();
        return;
    }

    const isRequesting = await cacheModule.globalCache.get(controlKey);

    if (isRequesting === '1') {
        throw new RequestInProgressError('This path is currently fetching, please come back later!');
    }

    const value = await cacheModule.globalCache.get(key);

    if (value) {
        ctx.status(200);
        ctx.header('RSSHub-Cache-Status', 'HIT');
        ctx.set('data', JSON.parse(value));
        await next();
        return;
    }

    // Doesn't hit the cache? We need to let others know!
    await cacheModule.globalCache.set(controlKey, '1', config.cache.requestTimeout);

    try {
        await next();
    } catch (error) {
        await cacheModule.globalCache.set(controlKey, '0', config.cache.requestTimeout);
        throw error;
    }

    const data: Data = ctx.get('data');
    if (ctx.res.headers.get('Cache-Control') !== 'no-cache' && data) {
        data.lastBuildDate = new Date().toUTCString();
        ctx.set('data', data);
        const body = JSON.stringify(data);
        await cacheModule.globalCache.set(key, body, config.cache.routeExpire);
    }

    // We need to let it go, even no cache set.
    // Wait to set cache so the next request could be handled correctly
    await cacheModule.globalCache.set(controlKey, '0', config.cache.requestTimeout);
};

export default middleware;
