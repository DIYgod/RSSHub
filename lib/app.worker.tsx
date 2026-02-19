// Worker-specific app configuration
// This is a simplified version of app-bootstrap.tsx for Cloudflare Workers
// Heavy middleware and API routes are excluded

import type { KVNamespace } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { trimTrailingSlash } from 'hono/trailing-slash';

import { errorHandler, notFoundHandler } from '@/errors';
import accessControl from '@/middleware/access-control';
import cache from '@/middleware/cache';
import debug from '@/middleware/debug';
import header from '@/middleware/header';
import mLogger from '@/middleware/logger';
import template from '@/middleware/template';
import trace from '@/middleware/trace';
import registry from '@/registry';
import { setKVNamespace } from '@/utils/cache/index.worker';
import { setBrowserBinding } from '@/utils/puppeteer';

// Define Worker environment bindings
type Bindings = {
    BROWSER?: any; // Browser Rendering API binding
    CACHE?: KVNamespace; // KV namespace for caching
};

const app = new Hono<{ Bindings: Bindings }>();

// Set browser and KV bindings
app.use(async (c, next) => {
    if (c.env?.BROWSER) {
        setBrowserBinding(c.env.BROWSER);
    }
    if (c.env?.CACHE) {
        setKVNamespace(c.env.CACHE);
    }
    await next();
});

app.use(trimTrailingSlash());

// Cloudflare Workers handles compression at the edge, no need for compress()

app.use(
    jsxRenderer(({ children }) => <>{children}</>, {
        docType: '<?xml version="1.0" encoding="UTF-8"?>',
        stream: {},
    })
);
app.use(mLogger);
app.use(trace);

// Heavy middleware excluded in Worker build:
// - sentry: @sentry/node
// - antiHotlink: cheerio
// - parameter: cheerio, sanitize-html, @jocmp/mercury-parser

app.use(cache);
app.use(accessControl);
app.use(debug);
app.use(template);
app.use(header);

app.route('/', registry);

// API routes not available in Worker environment

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
