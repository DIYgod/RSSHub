const logger = require('@/utils/logger');
const config = require('@/config').value;
const Sentry = require('@sentry/node');
const art = require('art-template');
const path = require('path');

if (config.sentry) {
    Sentry.init({
        dsn: config.sentry,
    });
    Sentry.configureScope((scope) => {
        scope.setTag('node_name', config.nodeName);
    });

    logger.info('Sentry inited.');
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

        if (config.isPackage) {
            ctx.body = {
                error: {
                    message: err.message,
                },
            };
        } else {
            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });
            ctx.body = art(path.resolve(__dirname, '../views/error.art'), {
                message,
            });
            if (ctx.status !== 403) {
                ctx.status = 404;
            }
        }

        if (!ctx.debug.errorPaths[ctx.request.path]) {
            ctx.debug.errorPaths[ctx.request.path] = 0;
        }
        ctx.debug.errorPaths[ctx.request.path]++;

        if (!ctx.debug.errorRoutes[ctx._matchedRoute]) {
            ctx.debug.errorRoutes[ctx._matchedRoute] = 0;
        }
        ctx.debug.errorRoutes[ctx._matchedRoute]++;

        if (!ctx.state.debuged) {
            if (!ctx.debug.routes[ctx._matchedRoute]) {
                ctx.debug.routes[ctx._matchedRoute] = 0;
            }
            ctx.debug.routes[ctx._matchedRoute]++;

            if (ctx.response.get('X-Koa-Redis-Cache') || ctx.response.get('X-Koa-Memory-Cache')) {
                ctx.debug.hitCache++;
            }
        }

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
