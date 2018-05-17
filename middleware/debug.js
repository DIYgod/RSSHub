module.exports = async (ctx, next) => {
    if (!ctx.debug.routes[ctx.request.path]) {
        ctx.debug.routes[ctx.request.path] = 0;
    }
    ctx.debug.routes[ctx.request.path]++;

    const ip = ctx.ips[0] || ctx.ip;
    if (!ctx.debug.ips[ip]) {
        ctx.debug.ips[ip] = 0;
    }
    ctx.debug.ips[ip]++;

    if (ctx.request.path !== '/') {
        ctx.debug.request++;
    }

    await next();

    if (ctx.request.path !== '/') {
        if (ctx.response.get('X-Koa-Redis-Cache') || ctx.response.get('X-Koa-Memory-Cache')) {
            ctx.debug.hitCache++;
        }
    }
};
