import { MiddlewareHandler } from 'hono';
import logger from '@/utils/logger';
import { config } from '@/config';
import * as Sentry from '@sentry/node';
import { getRouteNameFromPath } from '@/utils/helpers';

if (config.sentry.dsn) {
    Sentry.init({
        dsn: config.sentry.dsn,
    });
    Sentry.getCurrentScope().setTag('node_name', config.nodeName);

    logger.info('Sentry inited.');
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    const time = Date.now();
    await next();
    if (config.sentry.dsn && Date.now() - time >= config.sentry.routeTimeout) {
        Sentry.withScope((scope) => {
            scope.setTag('name', getRouteNameFromPath(ctx.req.path));
            Sentry.captureException(new Error('Route Timeout'));
        });
    }
};

export default middleware;
