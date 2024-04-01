import { type NotFoundHandler, type ErrorHandler } from 'hono';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';
import { config } from '@/config';
import Sentry from '@sentry/node';
import logger from '@/utils/logger';
import Error from '@/views/error';

import RequestInProgressError from './request-in-progress';
import RejectError from './reject';
import NotFoundError from './not-found';

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

    let message = '';
    if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError' || error.name === 'FetchError')) {
        ctx.status(503);
        message = `${error.message}: target website might be blocking our access, you can host your own RSSHub instance for a better usability.`;
    } else if (error instanceof RequestInProgressError) {
        ctx.header('Cache-Control', `public, max-age=${config.requestTimeout / 1000}`);
        ctx.status(503);
        message = error.message;
    } else if (error instanceof RejectError) {
        ctx.status(403);
        message = error.message;
    } else if (error instanceof NotFoundError) {
        ctx.status(404);
        message = 'wrong path';
        if (ctx.req.path.endsWith('/')) {
            message += ', you can try removing the trailing slash in the path';
        }
    } else {
        ctx.status(503);
        message = process.env.NODE_ENV === 'production' ? error.message : error.stack || error.message;
    }

    logger.error(`Error in ${requestPath}: ${message}`);

    return config.isPackage ? ctx.json({
        error: {
            message: error.message ?? error,
        },
    }) : ctx.html((
        <Error
            requestPath={requestPath}
            message={message}
            errorRoute={hasMatchedRoute ? matchedRoute : requestPath}
            nodeVersion={process.version}
        />
    ));
};

export const notFoundHandler: NotFoundHandler = (ctx) => errorHandler(new NotFoundError(), ctx);
