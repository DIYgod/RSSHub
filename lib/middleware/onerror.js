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
    Sentry.getCurrentScope().setTag('node_name', config.nodeName);

    logger.info('Sentry inited.');
}

try {
    gitHash = require('git-rev-sync').short();
} catch {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || (process.env.VERCEL_GIT_COMMIT_SHA && process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)) || 'unknown';
}

module.exports = async (ctx, next) => {
    try {
        const time = Date.now();
        await next();
        if (config.sentry.dsn && Date.now() - time >= config.sentry.routeTimeout) {
            Sentry.withScope((scope) => {
                scope.setTag('route', ctx._matchedRoute);
                scope.setTag('name', ctx.request.path.split('/')[1]);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(new Error('Route Timeout'));
            });
        }
    } catch (error) {
        if (error instanceof Error && !error.stack.split('\n')[1].includes('lib/middleware/parameter.js')) {
            // Append v2 route path if a route throws an error
            // since koa-mount will remove the mount path from ctx.request.path
            // https://github.com/koajs/mount/issues/62
            ctx.request.path = (ctx.mountPath ?? '') + ctx.request.path;
            ctx._matchedRoute = ctx._matchedRoute ? (ctx.mountPath ?? '') + ctx._matchedRoute : ctx._matchedRoute;
        }

        let message = error;
        if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError')) {
            message = `${error.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;
        } else if (error instanceof Error) {
            message = process.env.NODE_ENV === 'production' ? error.message : error.stack;
        }

        logger.error(`Error in ${ctx.request.path}: ${message}`);

        if (config.isPackage) {
            ctx.body = {
                error: {
                    message: error.message ?? error,
                },
            };
        } else {
            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });

            if (error instanceof RequestInProgressError) {
                ctx.status = 503;
                message = error.message;
                ctx.set('Cache-Control', `public, max-age=${config.cache.requestTimeout}`);
            } else if (ctx.status === 403) {
                message = error.message;
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
                Sentry.captureException(error);
            });
        }
    }
};
