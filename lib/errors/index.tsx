import Honeybadger from '@honeybadger-io/js';
import type { ErrorHandler, NotFoundHandler } from 'hono';
import { routePath } from 'hono/route';
import { FetchError } from 'ofetch';

import { config } from '@/config';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';
import logger from '@/utils/logger';
import { requestMetric } from '@/utils/otel';
import Error from '@/views/error';

import NotFoundError from './types/not-found';

const Sentry = config.sentry.dsn ? await import('@sentry/node') : undefined;

// FetchError quotes the full request URL in its message, and some routes put the operator's API key or token
// in the path or query of that URL, so only its origin is shown to clients (the log keeps the full URL)
const hideRequestUrl = (error: Error, text: string) => {
    if (!(error instanceof FetchError) || !error.request) {
        return text;
    }
    const url = typeof error.request === 'string' ? error.request : error.request.url;
    const origin = URL.canParse(url) ? new URL(url).origin : '';
    return text.replaceAll(JSON.stringify(url), () => JSON.stringify(origin)).replaceAll(url, () => origin);
};

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

    const errorPathCount = debug.errorPaths[requestPath];
    if (!errorPathCount) {
        debug.errorPaths[requestPath] = 0;
    }
    debug.errorPaths[requestPath]++;

    const errorRouteCount = debug.errorRoutes[matchedRoute];
    if (!errorRouteCount && hasMatchedRoute) {
        debug.errorRoutes[matchedRoute] = 0;
    }
    hasMatchedRoute && debug.errorRoutes[matchedRoute]++;
    setDebugInfo(debug);

    if (config.honeybadger.apiKey) {
        Honeybadger.notify(error, {
            context: { name: requestPath.split('/', 2)[1] },
        });
    }

    if (Sentry) {
        Sentry.withScope((scope) => {
            scope.setTag('name', requestPath.split('/', 2)[1]);
            Sentry.captureException(error);
        });
    }

    let errorMessage = (process.env.NODE_ENV || process.env.VERCEL_ENV) === 'production' || !error.stack ? `${error.name}: ${error.message}` : error.stack;
    switch (error.name) {
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
    logger.error(`Error in ${requestPath}: ${errorMessage}`);
    errorMessage = hideRequestUrl(error, errorMessage);
    requestMetric.error({ path: matchedRoute, method: ctx.req.method, status: ctx.res.status });

    return config.isPackage || ctx.req.query('format') === 'json'
        ? ctx.json({
              error: {
                  message: hideRequestUrl(error, error.message) ?? error,
              },
          })
        : ctx.html(<Error requestPath={requestPath} message={errorMessage} errorRoute={hasMatchedRoute ? matchedRoute : requestPath} nodeVersion={process.version} />);
};

export const notFoundHandler: NotFoundHandler = (ctx) => errorHandler(new NotFoundError(), ctx);
