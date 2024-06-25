import type { Namespace, Route } from '@/types';
import { directoryImport } from 'directory-import';
import { Hono, type Handler } from 'hono';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from '@hono/node-server/serve-static';

import index from '@/routes/index';
import robotstxt from '@/routes/robots.txt';

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
for (const namespace in namespaces) {
    const subApp = app.basePath(`/${namespace}`);
    for (const path in namespaces[namespace].routes) {
        const wrappedHandler: Handler = async (ctx) => {
            if (!ctx.get('data')) {
                if (typeof namespaces[namespace].routes[path].handler !== 'function') {
                    const { route } = await import(`./routes/${namespace}/${namespaces[namespace].routes[path].location}`);
                    namespaces[namespace].routes[path].handler = route.handler;
                }
                ctx.set('data', await namespaces[namespace].routes[path].handler(ctx));
            }
        };
        subApp.get(path, wrappedHandler);
    }
}

app.get('/', index);
app.get('/robots.txt', robotstxt);
app.use(
    '/*',
    serveStatic({
        root: './lib/assets',
        rewriteRequestPath: (path) => (path === '/favicon.ico' ? '/favicon.png' : path),
    })
);

export default app;
