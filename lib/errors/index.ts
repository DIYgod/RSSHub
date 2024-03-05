import { type NotFoundHandler, type ErrorHandler } from 'hono';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';
import { config } from '@/config';
import Sentry from '@sentry/node';
import logger from '@/utils/logger';
import art from 'art-template';
import * as path from 'node:path';
import { gitHash } from '@/utils/git-hash';

import RequestInProgressError from './request-in-progress';
import RejectError from './reject';
import NotFoundError from './not-found';

import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

export const errorHandler: ErrorHandler = (error, ctx) => {
    const requestPath = ctx.req.path;
    const matchedRoute = ctx.req.routePath;
    const hasMatchedRoute = matchedRoute !== '/*';
    let message = '';
    if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError')) {
        message = `${error.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;
    } else if (error instanceof Error) {
        message = process.env.NODE_ENV === 'production' ? error.message : error.stack || error.message;
    }

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

    logger.error(`Error in ${requestPath}: ${message}`);

    if (config.isPackage) {
        return ctx.json({
            error: {
                message: error.message ?? error,
            },
        });
    } else {
        if (error instanceof RequestInProgressError) {
            ctx.header('Cache-Control', `public, max-age=${config.requestTimeout / 1000}`);
            ctx.status(503);
            message = error.message;
        } else if (error instanceof RejectError) {
            ctx.status(403);
            message = error.message;
        } else if (error instanceof NotFoundError) {
            ctx.status(404);
            message = 'wrong path';
        } else {
            ctx.status(404);
        }

        return ctx.html(
            art(path.resolve(__dirname, '../views/error.art'), {
                requestPath,
                message,
                errorRoute: hasMatchedRoute ? matchedRoute : requestPath,
                nodeVersion: process.version,
                gitHash,
            })
        );
    }
};

export const notFoundHandler: NotFoundHandler = (ctx) => errorHandler(new NotFoundError(), ctx);
