import { MiddlewareHandler } from "hono";
import logger from "@/utils/logger";
import { config } from "@/config";
import art from 'art-template';
import * as path from 'node:path';
import { RequestInProgressError } from '@/errors';
import Sentry from '@sentry/node';
import { getRouteNameFromPath } from "@/utils/helpers";
import gitRevSync from 'git-rev-sync';

let gitHash;

if (config.sentry.dsn) {
    Sentry.init({
        dsn: config.sentry.dsn,
    });
    Sentry.getCurrentScope().setTag('node_name', config.nodeName);

    logger.info('Sentry inited.');
}

try {
    gitHash = gitRevSync.short();
} catch {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || (process.env.VERCEL_GIT_COMMIT_SHA && process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)) || 'unknown';
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    try {
        const time = Date.now();
        await next();
        if (config.sentry.dsn && Date.now() - time >= config.sentry.routeTimeout) {
            Sentry.withScope((scope) => {
                scope.setTag('name', getRouteNameFromPath(ctx.req.path));
                Sentry.captureException(new Error('Route Timeout'));
            });
        }
    } catch (error: any) {
        let message = error;
        if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError')) {
            message = `${error.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;
        } else if (error instanceof Error) {
            message = process.env.NODE_ENV === 'production' ? error.message : error.stack;
        }

        logger.error(`Error in ${ctx.req.path}: ${message}`);

        if (config.isPackage) {
            ctx.json({
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

            ctx.body = art(path.resolve(__dirname, '../views/error.art'), {
                requestPath,
                message,
                errorPath: ctx.req.path,
                nodeVersion: process.version,
                gitHash,
            });
        }

        const debug = ctx.get('debug');
        if (ctx.res.headers.get('X-Koa-Redis-Cache') || ctx.res.headers.get('X-Koa-Memory-Cache')) {
            debug.hitCache++;
        }

        if (config.sentry.dsn) {
            Sentry.withScope((scope) => {
                scope.setTag('name', ctx.req.path.split('/')[1]);
                Sentry.captureException(error);
            });
        }
    }
};

export default middleware;