import type { MiddlewareHandler } from 'hono';
import { routePath } from 'hono/route';

import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';

const middleware: MiddlewareHandler = async (ctx, next) => {
    {
        const debug = getDebugInfo();
        const pathCount = debug.paths[ctx.req.path];
        if (!pathCount) {
            debug.paths[ctx.req.path] = 0;
        }
        debug.paths[ctx.req.path]++;

        debug.request++;
        setDebugInfo(debug);
    }

    await next();

    {
        const debug = getDebugInfo();
        const rPath = routePath(ctx);
        const hasMatchedRoute = rPath !== '/*';
        const routeCount = debug.routes[rPath];
        if (!routeCount && hasMatchedRoute) {
            debug.routes[rPath] = 0;
        }
        hasMatchedRoute && debug.routes[rPath]++;

        if (ctx.res.headers.get('RSSHub-Cache-Status')) {
            debug.hitCache++;
        }

        if (ctx.res.status === 304) {
            debug.etag++;
        }
        setDebugInfo(debug);
    }
};

export default middleware;
