import xxhash from 'xxhash-wasm';
import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import RequestInProgressError from '@/errors/types/request-in-progress';
import cacheModule from '@/utils/cache/index';
import { Data } from '@/types';

const bypassList = new Set(['/', '/robots.txt', '/logo.png', '/favicon.ico']);
// only give cache string, as the `!` condition tricky
// XXH64 is used to shrink key size
// plz, write these tips in comments!
const middleware: MiddlewareHandler = async (ctx, next) => {
    if (!cacheModule.status.available || bypassList.has(ctx.req.path)) {
        await next();
        return;
    }

    const requestPath = ctx.req.path;
    const format = `:${ctx.req.query('format') || 'rss'}`;
    const limit = ctx.req.query('limit') ? `:${ctx.req.query('limit')}` : '';
    const { h64ToString } = await xxhash();
    const key = 'rsshub:koa-redis-cache:' + h64ToString(requestPath + format + limit);
    const controlKey = 'rsshub:path-requested:' + h64ToString(requestPath + format + limit);

    const isRequesting = await cacheModule.globalCache.get(controlKey);

    if (isRequesting === '1') {
        let retryTimes = process.env.NODE_ENV === 'test' ? 1 : 10;
        let bypass = false;
        while (retryTimes > 0) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === 'test' ? 3000 : 6000));
            // eslint-disable-next-line no-await-in-loop
            if ((await cacheModule.globalCache.get(controlKey)) !== '1') {
                bypass = true;
                break;
            }
            retryTimes--;
        }
        if (!bypass) {
            throw new RequestInProgressError('This path is currently fetching, please come back later!');
        }
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

    // let routers control cache
    ctx.set('cacheKey', key);
    ctx.set('cacheControlKey', controlKey);

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
