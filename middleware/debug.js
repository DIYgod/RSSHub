module.exports = async (ctx, next) => {
    await next();

    if (ctx.request.path !== '/') {
        ctx.debug.request++;
        if (ctx.response.get('X-Koa-Redis-Cache') || ctx.response.get('X-Koa-Memory-Cache')) {
            ctx.debug.hitCache++;
        }
    }
};
