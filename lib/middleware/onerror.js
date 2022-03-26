const logger = require('@/utils/logger');
const config = require('@/config').value;
const art = require('art-template');
const path = require('path');

const { RequestInProgressError } = require('@/errors');

let Sentry;
let gitHash;

if (config.sentry.dsn) {
    Sentry = Sentry || require('@sentry/node');
    Sentry.init({
        dsn: config.sentry.dsn,
    });
    Sentry.configureScope((scope) => {
        scope.setTag('node_name', config.nodeName);
    });

    logger.info('Sentry inited.');
}

try {
    gitHash = require('git-rev-sync').short();
} catch (e) {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || (process.env.VERCEL_GITHUB_COMMIT_SHA && process.env.VERCEL_GITHUB_COMMIT_SHA.slice(0, 7)) || 'unknown';
}

module.exports = async (ctx, next) => {
    try {
        const time = +new Date();
        await next();
        if (config.sentry.dsn && +new Date() - time >= config.sentry.routeTimeout) {
            Sentry.withScope((scope) => {
                scope.setTag('route', ctx._matchedRoute);
                scope.setTag('name', ctx.request.path.split('/')[1]);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(new Error('Route Timeout'));
            });
        }
    } catch (err) {
        let message = err;
        if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
            message = `${err.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;
        } else if (err instanceof Error) {
            message = process.env.NODE_ENV === 'production' ? err.message : err.stack;
        }

        logger.error(`Error in ${ctx.request.path}: ${message}`);

        if (config.isPackage) {
            ctx.body = {
                error: {
                    message: err.message ? err.message : err,
                },
            };
        } else {
            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });

            if (err instanceof RequestInProgressError) {
                ctx.status = 503;
                message = err.message;
            } else if (ctx.status === 403) {
                message = err.message;
            } else {
                ctx.status = 404;
            }

            const requestPath = ctx.request.path;

            ctx.body = art(path.resolve(__dirname, '../views/error.art'), {
                requestPath,
                message,
                errorPath: ctx.path,
                nodeVersion: process.version,
                gitHash,
            });
        }

        if (!ctx.debug.errorPaths[ctx.request.path]) {
            ctx.debug.errorPaths[ctx.request.path] = 0;
        }
        ctx.debug.errorPaths[ctx.request.path]++;

        if (!ctx.debug.errorRoutes[ctx._matchedRoute]) {
            ctx._matchedRoute && (ctx.debug.errorRoutes[ctx._matchedRoute] = 0);
        }
        ctx._matchedRoute && ctx.debug.errorRoutes[ctx._matchedRoute]++;

        if (!ctx.state.debuged) {
            if (!ctx.debug.routes[ctx._matchedRoute]) {
                ctx._matchedRoute && (ctx.debug.routes[ctx._matchedRoute] = 0);
            }
            ctx._matchedRoute && ctx.debug.routes[ctx._matchedRoute]++;

            if (ctx.response.get('X-Koa-Redis-Cache') || ctx.response.get('X-Koa-Memory-Cache')) {
                ctx.debug.hitCache++;
            }
        }

        if (config.sentry.dsn) {
            Sentry.withScope((scope) => {
                scope.setTag('route', ctx._matchedRoute);
                scope.setTag('name', ctx.request.path.split('/')[1]);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(err);
            });
        }
    }
};
