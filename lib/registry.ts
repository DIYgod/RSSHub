import type { Namespace, Route } from '@/types';
import { directoryImport } from 'directory-import';
import type { Hono, Handler } from 'hono';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from '@hono/node-server/serve-static';

import index from '@/routes/index';
import robotstxt from '@/routes/robots.txt';
import { namespace as testNamespace } from './routes-new/test/namespace';
import { route as testRoute } from '@/routes-new/test/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let modules: Record<string, { route: Route } | { namespace: Namespace }> = {};

switch (process.env.NODE_ENV) {
    case 'test':
        modules = {
            '/test/namespace.ts': {
                namespace: testNamespace,
            },
            '/test/index.ts': {
                route: testRoute,
            },
        };
        break;
    default:
        modules = directoryImport({
            targetDirectoryPath: path.join(__dirname, './routes-new'),
            importPattern: /\.ts$/,
        }) as typeof modules;
}

const namespaces: Record<
    string,
    Namespace & {
        routes: Record<string, Route>;
    }
> = {};

for (const module in modules) {
    const content = modules[module] as
        | {
              route: Route;
          }
        | {
              namespace: Namespace;
          };
    const namespace = module.split('/')[1];
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
                namespaces[namespace].routes[path] = content.route;
            }
        } else {
            namespaces[namespace].routes[content.route.path] = content.route;
        }
    }
}

export { namespaces };

export default function (app: Hono) {
    for (const namespace in namespaces) {
        const subApp = app.basePath(`/${namespace}`);
        for (const path in namespaces[namespace].routes) {
            const wrapedHandler: Handler = async (ctx) => {
                if (!ctx.get('data')) {
                    ctx.set('data', await namespaces[namespace].routes[path].handler(ctx));
                }
            };
            subApp.get(path, wrapedHandler);
        }
    }

    // routes without rss data
    app.get('/', index);
    app.get('/robots.txt', robotstxt);

    app.use(
        '/*',
        serveStatic({
            root: './lib/assets',
            rewriteRequestPath: (path) => (path === '/favicon.ico' ? '/favicon.png' : path),
        })
    );
}
