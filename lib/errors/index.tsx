import * as Sentry from '@sentry/node';
import { type ErrorHandler, type NotFoundHandler } from 'hono';
import { routePath } from 'hono/route';

import { config } from '@/config';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';
import logger from '@/utils/logger';
import { requestMetric } from '@/utils/otel';
import Error from '@/views/error';

import NotFoundError from './types/not-found';

export const errorHandler: ErrorHandler = (error, ctx) => {
    const requestPath = ctx.req.path;
    const matchedRoute = routePath(ctx);
    const hasMatchedRoute = matchedRoute !== '/*';

    const debug = getDebugInfo();
    try {
        if (ctx.res.headers.get('RSSHub-Cache-Status')) {
            debug.hitCache++;
        }
    } catch {
        // ignore
    }
    debug.error++;

    if (!debug.errorPaths[requestPath]) {
        debug.errorPaths[requestPath] = 0;
    }
    debug.errorPaths[requestPath]++;

    if (!debug.errorRoutes[matchedRoute] && hasMatchedRoute) {
        debug.errorRoutes[matchedRoute] = 0;
    }
    hasMatchedRoute && debug.errorRoutes[matchedRoute]++;
    setDebugInfo(debug);

    if (config.sentry.dsn) {
        Sentry.withScope((scope) => {
            scope.setTag('name', requestPath.split('/')[1]);
            Sentry.captureException(error);
        });
    }

    let errorMessage = (process.env.NODE_ENV || process.env.VERCEL_ENV) === 'production' ? error.message : error.stack || error.message;
    switch (error.constructor.name) {
        case 'HTTPError':
        case 'RequestError':
        case 'FetchError':
            ctx.status(503);
            break;
        case 'RequestInProgressError':
            ctx.header('Cache-Control', `public, max-age=${config.requestTimeout / 1000}`);
            ctx.status(503);
            break;
        case 'RejectError':
            ctx.status(403);
            break;
        case 'NotFoundError':
            ctx.status(404);
            errorMessage += 'The route does not exist or has been deleted.';
            break;
        default:
            ctx.status(503);
            break;
    }
    const message = `${error.name}: ${errorMessage}`;

    logger.error(`Error in ${requestPath}: ${message}`);
    requestMetric.error({ path: matchedRoute, method: ctx.req.method, status: ctx.res.status });

    return config.isPackage || ctx.req.query('format') === 'json'
        ? ctx.json({
              error: {
                  message: error.message ?? error,
              },
          })
        : ctx.html(<Error requestPath={requestPath} message={message} errorRoute={hasMatchedRoute ? matchedRoute : requestPath} nodeVersion={process.version} />);
};

export const notFoundHandler: NotFoundHandler = (ctx) => errorHandler(new NotFoundError(), ctx);
