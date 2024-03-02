import { directoryImport } from 'directory-import';
import type { Hono, Handler } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import * as path from 'node:path';

import index from '@/routes/index';
import robotstxt from '@/routes/robots.txt';

type Root = {
    get: (routePath: string, filePath: string) => void;
};

const imports = directoryImport({
    targetDirectoryPath: path.join(__dirname, './routes'),
    importPattern: /router\.js$/,
});

const routes: Record<string, (root: Root) => void> = {};

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
