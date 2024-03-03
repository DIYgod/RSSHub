import { directoryImport } from 'directory-import';
import type { Hono, Handler } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import * as path from 'node:path';

import index from '@/routes/index';
import robotstxt from '@/routes/robots.txt';
import test from '@/routes/test/router';

import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

type Root = {
    get: (routePath: string, filePath: string) => void;
};

const routes: Record<string, (root: Root) => void> = {};

if (process.env.NODE_ENV === 'test') {
    routes.test = test;
} else {
    const imports = directoryImport({
        targetDirectoryPath: path.join(__dirname, './routes'),
        importPattern: /router\.ts$/,
    });
    for (const path in imports) {
        const name = path.split('/').find(Boolean);
        if (name) {
            routes[name] = (
                imports[path] as {
                    default: (root: Root) => void;
                }
            ).default;
        }
    }
}

export default function (app: Hono) {
    for (const name in routes) {
        const subApp = app.basePath(`/${name}`);
        routes[name]({
            get: (routePath, filePath) => {
                const wrapedHandler: Handler = async (ctx, ...args) => {
                    if (!ctx.get('data')) {
                        const { default: handler } = await import(path.join(__dirname, 'routes', name, filePath));
                        await handler(ctx, ...args);
                    }
                };
                subApp.get(routePath, wrapedHandler);
            },
        });
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
