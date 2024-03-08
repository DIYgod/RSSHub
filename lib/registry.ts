import type { Namespace, Route } from '@/types';
import { directoryImport } from 'directory-import';
import type { Hono, Handler } from 'hono';
import * as path from 'node:path';

const modules = directoryImport({
    targetDirectoryPath: path.join(__dirname, './routes-new'),
    importPattern: /\.ts$/,
});

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
        namespaces[namespace].routes[content.route.path] = content.route;
    }
}

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
}
