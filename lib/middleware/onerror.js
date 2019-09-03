const logger = require('@/utils/logger');
const config = require('@/config');
const Sentry = require('@sentry/node');

if (config.sentry) {
    Sentry.init({
        dsn: config.sentry,
    });
    Sentry.configureScope((scope) => {
        scope.setTag('node_name', config.nodeName);
    });
}

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        logger.error(`Error in ${ctx.request.path}: ${err instanceof Error ? err.stack : err}`);
        ctx.set({
            'Content-Type': 'text/html; charset=UTF-8',
        });
        ctx.body = `RSSHub 发生了一些意外: <pre>${err instanceof Error ? err.stack : err}</pre>`;
        ctx.status = 404;

        if (!ctx.debug.errorPaths[ctx.request.path]) {
            ctx.debug.errorPaths[ctx.request.path] = 0;
        }
        ctx.debug.errorPaths[ctx.request.path]++;

        if (!ctx.debug.errorRoutes[ctx._matchedRoute]) {
            ctx.debug.errorRoutes[ctx._matchedRoute] = 0;
        }
        ctx.debug.errorRoutes[ctx._matchedRoute]++;

        if (config.sentry) {
            Sentry.withScope((scope) => {
                scope.setTag('route', ctx._matchedRoute);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(err);
            });
        }
    }
};
