// Worker-specific app configuration
// Keep feed processing and API routes aligned with app-bootstrap.tsx.

import type { KVNamespace } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { trimTrailingSlash } from 'hono/trailing-slash';

import api from '@/api';
import { errorHandler, notFoundHandler } from '@/errors';
import accessControl from '@/middleware/access-control';
import antiHotlink from '@/middleware/anti-hotlink';
import cache from '@/middleware/cache';
import debug from '@/middleware/debug';
import header from '@/middleware/header';
import mLogger from '@/middleware/logger';
import parameter from '@/middleware/parameter';
import template from '@/middleware/template';
import trace from '@/middleware/trace';
import registry from '@/registry';
import { setKVNamespace } from '@/utils/cache/index.worker';
import { setBrowserBinding, setPlaywrightServiceBinding } from '@/utils/playwright';

// Define Worker environment bindings
type Bindings = {
    PLAYWRIGHT_SERVICE?: any; // Optional remote Playwright service binding
    PLAYWRIGHT_SERVICE_ORIGIN?: string;
    BROWSER?: any; // Browser Rendering API binding
    CACHE?: KVNamespace; // KV namespace for caching
};

const app = new Hono<{ Bindings: Bindings }>();

// Set browser and KV bindings
app.use(async (c, next) => {
    setBrowserBinding(c.env?.BROWSER);
    setPlaywrightServiceBinding(c.env?.PLAYWRIGHT_SERVICE, c.env?.PLAYWRIGHT_SERVICE_ORIGIN);
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

// Monitoring integrations that depend on Node.js remain disabled.

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
