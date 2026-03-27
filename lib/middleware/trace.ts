import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import { getPath } from '@/utils/helpers';
import { tracer } from '@/utils/otel';

const middleware: MiddlewareHandler = async (ctx, next) => {
    if (config.debugInfo) {
        // Only enable tracing in debug mode
        const { method, raw } = ctx.req;
        const path = getPath(raw);

        const span = tracer.startSpan(`${method} ${path}`, {
            kind: 1, // server
            attributes: {},
        });
        span.addEvent('invoking handleRequest');
        await next();
        span.end();
    } else {
        // Skip
        await next();
    }
};

export default middleware;
