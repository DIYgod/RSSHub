import { MiddlewareHandler } from 'hono';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';

const middleware: MiddlewareHandler = async (ctx, next) => {
    {
        const debug = getDebugInfo();
        debug.request++;
        setDebugInfo(debug);
    }

    await next();

    {
        const debug = getDebugInfo();
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
