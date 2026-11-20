import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import { getRouteNameFromPath } from '@/utils/helpers';
import logger from '@/utils/logger';

const loadSentry = () => import('@sentry/node');
let Sentry: Awaited<ReturnType<typeof loadSentry>> | undefined;

if (config.sentry.dsn) {
    Sentry = await loadSentry();
    Sentry.init({
        dsn: config.sentry.dsn,
    });
    Sentry.getCurrentScope().setTag('node_name', config.nodeName);

    logger.info('Sentry inited.');
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    const time = performance.now();
    await next();
    if (Sentry && performance.now() - time >= config.errorTrackingRouteTimeout) {
        Sentry.withScope((scope) => {
            scope.setTag('name', getRouteNameFromPath(ctx.req.path));
            Sentry.captureException(new Error('Route Timeout'));
        });
    }
};

export default middleware;
