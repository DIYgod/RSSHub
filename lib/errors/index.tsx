import { type NotFoundHandler, type ErrorHandler } from 'hono';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';
import { config } from '@/config';
import * as Sentry from '@sentry/node';
import logger from '@/utils/logger';
import Error from '@/views/error';

import NotFoundError from './types/not-found';

import { requestMetric } from '@/utils/otel';

export const errorHandler: ErrorHandler = (error, ctx) => {
    const requestPath = ctx.req.path;
    const matchedRoute = ctx.req.routePath;
    const hasMatchedRoute = matchedRoute !== '/*';

    const debug = getDebugInfo();
    if (ctx.res.headers.get('RSSHub-Cache-Status')) {
        debug.hitCache++;
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

    let errorMessage = process.env.NODE_ENV === 'production' ? error.message : error.stack || error.message;
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
    requestMetric.error({ path: requestPath, method: ctx.req.method, status: ctx.res.status });

    return config.isPackage
        ? ctx.json({
              error: {
                  message: error.message ?? error,
              },
          })
        : ctx.html(<Error requestPath={requestPath} message={message} errorRoute={hasMatchedRoute ? matchedRoute : requestPath} nodeVersion={process.version} />);
};

export const notFoundHandler: NotFoundHandler = (ctx) => errorHandler(new NotFoundError(), ctx);
