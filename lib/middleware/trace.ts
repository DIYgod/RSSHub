import { MiddlewareHandler } from 'hono';
import { getPath } from '@/utils/helpers';
import { tracer } from '@/utils/otel';

const middleware: MiddlewareHandler = async (ctx, next) => {
    const { method, raw } = ctx.req;
    const path = getPath(raw);

    const span = tracer.startSpan(`${method} ${path}`, {
        kind: 1, // server
        attributes: {},
    });
    span.addEvent('invoking handleRequest');
    await next();
    span.end();
};

export default middleware;
