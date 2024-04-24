import '@/utils/request-rewriter';

import { Hono } from 'hono';

import { compress } from 'hono/compress';
import mLogger from '@/middleware/logger';
import cache from '@/middleware/cache';
import template from '@/middleware/template';
import sentry from '@/middleware/sentry';
import accessControl from '@/middleware/access-control';
import debug from '@/middleware/debug';
import header from '@/middleware/header';
import antiHotlink from '@/middleware/anti-hotlink';
import parameter from '@/middleware/parameter';
import { jsxRenderer } from 'hono/jsx-renderer';
import { trimTrailingSlash } from 'hono/trailing-slash';

import logger from '@/utils/logger';

import { notFoundHandler, errorHandler } from '@/errors';
import registry from '@/registry';
import api from '@/api';

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Hono();

app.use(trimTrailingSlash());
app.use(compress());

app.use(
    jsxRenderer(({ children }) => <>{children}</>, {
        docType: '<?xml version="1.0" encoding="UTF-8"?>',
        stream: {},
    })
);
app.use(mLogger);
app.use(sentry);
app.use(accessControl);
app.use(debug);
app.use(template);
app.use(header);
app.use(antiHotlink);
app.use(parameter);
app.use(cache);

app.route('/', registry);
app.route('/api', api);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
