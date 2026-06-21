import type * as SentryType from '@sentry/node';
import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import { getRouteNameFromPath } from '@/utils/helpers';
import logger from '@/utils/logger';

let Sentry: typeof SentryType | undefined;

if (config.sentry.dsn) {
    Sentry = await import('@sentry/node');
    Sentry.init({
        dsn: config.sentry.dsn,
    });
    Sentry.getCurrentScope().setTag('node_name', config.nodeName);

    logger.info('Sentry inited.');
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    const time = Date.now();
    await next();
    if (Sentry && Date.now() - time >= config.errorTrackingRouteTimeout) {
        Sentry.withScope((scope) => {
            scope.setTag('name', getRouteNameFromPath(ctx.req.path));
            Sentry!.captureException(new Error('Route Timeout'));
        });
    }
};

export default middleware;
