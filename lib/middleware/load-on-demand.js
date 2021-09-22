const mount = require('koa-mount');
const Router = require('@koa/router');
const routes = require('../v2router');
const loadedRoutes = new Set();

module.exports = function (app) {
    return async function (ctx, next) {
        const p = ctx.request.path.split('/').filter((e) => e);
        let modName = null;
        let mounted = false;

        if (p.length > 0) {
            modName = p[0]
            if (!loadedRoutes.has(modName)) {
                const mod = routes[modName];
                // Mount module
                if (mod) {
                    mounted = true;
                    loadedRoutes.add(modName);
                    const router = new Router();
                    mod(router);
                    app.use(mount(`/${modName}`, router.routes())).use(router.allowedMethods());
                }
            } else {
                mounted = true;
            }
        }
        
        await next();

        // We need to fix the _matchedRoute exposed by koa router, append namespace
        if (mouted) {
            ctx._matchedRoute = `/${modName}${ctx._matchedRoute}`
        }
    };
};
