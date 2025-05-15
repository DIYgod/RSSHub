import { MiddlewareHandler } from 'hono';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';

const middleware: MiddlewareHandler = async (ctx, next) => {
    {
        const debug = getDebugInfo();
        if (!debug.paths[ctx.req.path]) {
            debug.paths[ctx.req.path] = 0;
        }
        debug.paths[ctx.req.path]++;

        debug.request++;
        setDebugInfo(debug);
    }

    await next();

    {
        const debug = getDebugInfo();
        const hasMatchedRoute = ctx.req.routePath !== '/*';
        if (!debug.routes[ctx.req.routePath] && hasMatchedRoute) {
            debug.routes[ctx.req.routePath] = 0;
        }
        hasMatchedRoute && debug.routes[ctx.req.routePath]++;

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
