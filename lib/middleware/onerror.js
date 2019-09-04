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
        let message = err;
        if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
            message = `${err.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;
        } else if (err instanceof Error) {
            message = err.stack;
        }
        logger.error(`Error in ${ctx.request.path}: ${message}`);
        ctx.set({
            'Content-Type': 'text/html; charset=UTF-8',
        });
        ctx.body = `Looks like something went wrong in RSSHub: <pre>${message}</pre>`;
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
                scope.setTag('name', ctx.request.path.split('/')[1]);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(err);
            });
        }
    }
};
