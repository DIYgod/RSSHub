import mount from 'koa-mount';
import Router from '@koa/router';
import routes from '../v2router.js';
const loadedRoutes = new Set();

export default function (app) {
    return async function (ctx, next) {
        const p = ctx.request.path.split('/').filter(Boolean);
        let modName = null;
        let mounted = false;

        if (p.length > 0) {
            modName = p[0];
            if (!loadedRoutes.has(modName)) {
                const mod = routes[modName];
                // Mount module
                if (mod) {
                    mounted = true;
                    loadedRoutes.add(modName);
                    const router = new Router();
                    await mod(router);
                    app.use(mount(`/${modName}`, router.routes())).use(router.allowedMethods());
                }
            } else {
                mounted = true;
            }
        }

        await next();
        // We should only add it when koa router matched
        if (mounted && ctx._matchedRoute) {
            ctx._matchedRoute = `/${modName}${ctx._matchedRoute}`;
        }
    };
};
