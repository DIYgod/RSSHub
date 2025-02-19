import type { Namespace, Route } from '@/types';
import { directoryImport } from 'directory-import';
import { Hono, type Handler } from 'hono';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from '@hono/node-server/serve-static';
import { config } from '@/config';

import index from '@/routes/index';
import healthz from '@/routes/healthz';
import robotstxt from '@/routes/robots.txt';
import metrics from '@/routes/metrics';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let modules: Record<string, { route: Route } | { namespace: Namespace }> = {};
let namespaces: Record<
    string,
    Namespace & {
        routes: Record<
            string,
            Route & {
                location: string;
            }
        >;
    }
> = {};

switch (process.env.NODE_ENV) {
    case 'test':
    case 'production':
        // @ts-expect-error
        namespaces = await import('../assets/build/routes.json');
        break;
    default:
        modules = directoryImport({
            targetDirectoryPath: path.join(__dirname, './routes'),
            importPattern: /\.ts$/,
        }) as typeof modules;
}

if (Object.keys(modules).length) {
    for (const module in modules) {
        const content = modules[module] as
            | {
                  route: Route;
              }
            | {
                  namespace: Namespace;
              };
        const namespace = module.split(/[/\\]/)[1];
        if ('namespace' in content) {
            namespaces[namespace] = Object.assign(
                {
                    routes: {},
                },
                namespaces[namespace],
                content.namespace
            );
        } else if ('route' in content) {
            if (!namespaces[namespace]) {
                namespaces[namespace] = {
                    name: namespace,
                    routes: {},
                };
            }
            if (Array.isArray(content.route.path)) {
                for (const path of content.route.path) {
                    namespaces[namespace].routes[path] = {
                        ...content.route,
                        location: module.split(/[/\\]/).slice(2).join('/'),
                    };
                }
            } else {
                namespaces[namespace].routes[content.route.path] = {
                    ...content.route,
                    location: module.split(/[/\\]/).slice(2).join('/'),
                };
            }
        }
    }
}

export { namespaces };

const app = new Hono();
const sortRoutes = (
    routes: Record<
        string,
        Route & {
            location: string;
        }
    >
) =>
    Object.entries(routes).sort(([pathA], [pathB]) => {
        const segmentsA = pathA.split('/');
        const segmentsB = pathB.split('/');
        const lenA = segmentsA.length;
        const lenB = segmentsB.length;
        const minLen = Math.min(lenA, lenB);

        for (let i = 0; i < minLen; i++) {
            const segmentA = segmentsA[i];
            const segmentB = segmentsB[i];

            // Literal segments have priority over parameter segments
            if (segmentA.startsWith(':') !== segmentB.startsWith(':')) {
                return segmentA.startsWith(':') ? 1 : -1;
            }
        }

        return 0;
    });

for (const namespace in namespaces) {
    const subApp = app.basePath(`/${namespace}`);

    const namespaceData = namespaces[namespace];
    if (!namespaceData || !namespaceData.routes) {
        continue;
    }

    const sortedRoutes = sortRoutes(namespaceData.routes);

    for (const [path, routeData] of sortedRoutes) {
        const wrappedHandler: Handler = async (ctx) => {
            if (!ctx.get('data')) {
                if (typeof routeData.handler !== 'function') {
                    const { route } = await import(`./routes/${namespace}/${routeData.location}`);
                    routeData.handler = route.handler;
                }
                ctx.set('data', await routeData.handler(ctx));
            }
        };
        subApp.get(path, wrappedHandler);
    }
}

app.get('/', index);
app.get('/healthz', healthz);
app.get('/robots.txt', robotstxt);
if (config.debugInfo) {
    // Only enable tracing in debug mode
    app.get('/metrics', metrics);
}
app.use(
    '/*',
    serveStatic({
        root: './lib/assets',
        rewriteRequestPath: (path) => (path === '/favicon.ico' ? '/favicon.png' : path),
    })
);

export default app;
