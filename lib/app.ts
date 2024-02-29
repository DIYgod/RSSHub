import '@/utils/request-wrapper';

import { Hono } from 'hono';

import cache from '@/middleware/cache';
import template from '@/middleware/template';
import sentry from '@/middleware/sentry';
import accessControl from '@/middleware/access-control';
import debug from '@/middleware/debug';
import header from '@/middleware/header';
import antiHotlink from '@/middleware/anti-hotlink';
import parameter from '@/middleware/parameter';
import logger from '@/utils/logger';

import routes from '@/routes';
import { notFoundHandler, errorHandler } from '@/errors';

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Hono();

app.use('*', sentry);
app.use('*', accessControl);
app.use('*', debug);
app.use('*', template);
app.use('*', header);
app.use('*', antiHotlink);
app.use('*', parameter);
app.use('*', cache);

routes(app);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
