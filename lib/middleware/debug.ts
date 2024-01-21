import { MiddlewareHandler } from "hono";
import { getRouteNameFromPath } from '@/utils/helpers';

const middleware: MiddlewareHandler = async (ctx, next) => {
    const debug = Object.assign({
        hitCache: 0,
        request: 0,
        etag: 0,
        paths: [],
        routes: [],
        errorPaths: [],
        errorRoutes: [],
    }, ctx.get('debug'));

    if (!debug.paths[ctx.req.path]) {
        debug.paths[ctx.req.path] = 0;
    }
    debug.paths[ctx.req.path]++;

    debug.request++;

    await next();

    const routeName = getRouteNameFromPath(ctx.req.path);
    if (routeName) {
        if (!debug.routes[routeName]) {
            debug.routes[routeName] = 0;
        }
        debug.routes[routeName]++;
    }

    if (ctx.res.headers.get('X-Koa-Redis-Cache') || ctx.res.headers.get('X-Koa-Memory-Cache')) {
        debug.hitCache++;
    }

    ctx.set('debuged', true);

    if (ctx.res.status === 304) {
        debug.etag++;
    }
};

export default middleware;