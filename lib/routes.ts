import { directoryImport } from 'directory-import';
import type { Hono, Handler } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';

import index from '@/v3/index';
import robotstxt from '@/v3/robots.txt';

type Root = {
    get: (path: string, handler: Handler) => void;
};

const imports = directoryImport({
    targetDirectoryPath: './v3',
    importPattern: /router\.js$/,
});

const routes: Record<string, (root: Root) => void> = {};

for (const path in imports) {
    const name = path.split('/').find(Boolean);
    if (name) {
        routes[name] = imports[path] as (root: Root) => void;
    }
}

export default function (app: Hono) {
    for (const name in routes) {
        const subApp = app.basePath(`/${name}`);
        routes[name]({
            get: (path, handler) => {
                const wrapedHandler: Handler = async (ctx, ...args) => {
                    if (!ctx.get('data')) {
                        await handler(ctx, ...args);
                    }
                };
                subApp.get(path, wrapedHandler);
            },
        });
    }

    // routes without rss data
    app.get('/', index);
    app.get('/robots.txt', robotstxt);

    app.use(
        '/*',
        serveStatic({
            root: './assets',
        })
    );
}
