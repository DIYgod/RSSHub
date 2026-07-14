import path from 'node:path';

import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { config } from '@/config';
import type { DevRegistry } from '@/registry-dev';
import type { NamespacesType, RoutesType } from '@/registry-helpers';
import { registerApiRoutes, registerRssRoutes } from '@/registry-helpers';
import healthz from '@/routes/healthz';
import index from '@/routes/index';
import metrics from '@/routes/metrics';
import robotstxt from '@/routes/robots.txt';
import type { Route } from '@/types';
import { isWorker } from '@/utils/is-worker';

export type { NamespacesType } from '@/registry-helpers';
export { collectNamespaceRoots, resolveModuleNamespace, sortRoutes } from '@/registry-helpers';

const __dirname = import.meta.dirname;

function isSafeRoutes(routes: RoutesType): boolean {
    return Object.values(routes).every((route: Route) => !route.features?.nsfw);
}

function safeNamespaces(namespaces: NamespacesType): NamespacesType {
    const safe: NamespacesType = {};

    for (const [key, value] of Object.entries(namespaces)) {
        if (value.routes === null || value.routes === undefined || isSafeRoutes(value.routes)) {
            safe[key] = value;
        }
    }
    return safe;
}

let namespaces: NamespacesType = {};
let devRegistry: DevRegistry | undefined;

if (config.isPackage) {
    namespaces = (await import('../assets/build/routes.js')).default;
} else {
    switch (process.env.NODE_ENV || process.env.VERCEL_ENV) {
        case 'production':
            namespaces = (await import('../assets/build/routes.js')).default;
            break;
        case 'test':
            // @ts-expect-error
            namespaces = await import('../assets/build/routes.json');
            if (namespaces.default) {
                // @ts-ignore
                namespaces = namespaces.default;
            }
            break;
        default: {
            // lazy load dev namespaces
            const { createDevRegistry } = await import('@/registry-dev');
            devRegistry = createDevRegistry({
                routesDirectory: path.join(__dirname, './routes'),
                namespaces,
            });
        }
    }
}

if (config.feature.disable_nsfw && !devRegistry) {
    namespaces = safeNamespaces(namespaces);
}

export const ensureAllLoaded: () => Promise<void> = devRegistry?.ensureAllLoaded ?? (() => Promise.resolve());

export { namespaces };

const app = new Hono();

if (!devRegistry) {
    registerRssRoutes(app, namespaces);
    registerApiRoutes(app, namespaces);
}

app.get('/', index);
app.get('/healthz', healthz);
app.get('/robots.txt', robotstxt);
if (config.debugInfo !== 'false') {
    // Only enable tracing in debug mode
    app.get('/metrics', metrics);
}

if (devRegistry) {
    app.use('*', devRegistry.middleware);
}

if (!config.isPackage && !process.env.VERCEL_ENV && !isWorker) {
    app.use(
        '/*',
        serveStatic({
            root: path.join(__dirname, 'assets'),
            rewriteRequestPath: (path) => (path === '/favicon.ico' ? '/favicon.png' : path),
        })
    );
}

export default app;
