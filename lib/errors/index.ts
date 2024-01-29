import { type ErrorHandler } from 'hono';
import _RequestInProgressError from './request-in-progress';
import { getDebugInfo, setDebugInfo } from '@/utils/debug-info';
import { config } from '@/config';
import Sentry from '@sentry/node';
import logger from '@/utils/logger';
import art from 'art-template';
import * as path from 'node:path';
import gitHash from '@/utils/git-hash';

export const RequestInProgressError = _RequestInProgressError;

export const errorHandler: ErrorHandler = (error, ctx) => {
    let message = '';
    if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError')) {
        message = `${error.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;
    } else if (error instanceof Error) {
        message = process.env.NODE_ENV === 'production' ? error.message : error.stack || error.message;
    }

    const debug = getDebugInfo();
    if (ctx.res.headers.get('RSSHub-Cache-Status')) {
        debug.hitCache++;
        setDebugInfo(debug);
    }

    if (config.sentry.dsn) {
        Sentry.withScope((scope) => {
            scope.setTag('name', ctx.req.path.split('/')[1]);
            Sentry.captureException(error);
        });
    }

    logger.error(`Error in ${ctx.req.path}: ${message}`);

    if (config.isPackage) {
        return ctx.json({
            error: {
                message: error.message ?? error,
            },
        });
    } else {
        ctx.header('Content-Type', 'text/html; charset=UTF-8');

        if (error instanceof RequestInProgressError) {
            ctx.status(503);
            message = error.message;
            ctx.set('Cache-Control', `public, max-age=${config.cache.requestTimeout}`);
        } else if (ctx.res.status === 403) {
            message = error.message;
        } else {
            ctx.status(404);
        }

        const requestPath = ctx.req.path;

        return ctx.body(
            art(path.resolve(__dirname, '../views/error.art'), {
                requestPath,
                message,
                errorPath: ctx.req.path,
                nodeVersion: process.version,
                gitHash,
            })
        );
    }
};
