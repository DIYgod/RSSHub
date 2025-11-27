import type { MiddlewareHandler } from 'hono';

const emptyMiddleware: MiddlewareHandler = async (ctx, next) => {
    await next();
};

export default emptyMiddleware;
