import type { Handler, Hono } from 'hono';

import type { RoutePath } from '@/../assets/build/route-paths';
import { type ConfigEnv, setConfig } from '@/config';

import type { Data, Namespace, Route } from './types';

export * from '@/types';
export { default as ofetch } from '@/utils/ofetch';
export * from '@/utils/parse-date';

let app: Hono | null = null;

function ensureAppInitialized(app: Hono | null): asserts app is Hono {
    if (!app) {
        throw new Error('RSSHub not initialized. Please call init() first.');
    }
}

export async function init(conf?: ConfigEnv) {
    setConfig(
        Object.assign(
            {
                IS_PACKAGE: true,
            },
            conf
        )
    );
    app = (await import('@/app')).default;
}

export async function request(path: RoutePath | (string & {})) {
    ensureAppInitialized(app);

    const res = await app.request(path);
    return res.json() as Promise<Data>;
}

export async function registerRoute(namespace: string, route: Route, namespaceConfig?: Namespace) {
    ensureAppInitialized(app);

    const { namespaces } = await import('./registry');

    if (!namespaces[namespace]) {
        namespaces[namespace] = {
            ...namespaceConfig,
            name: namespaceConfig?.name || namespace,
            routes: {},
            apiRoutes: {},
        };
    }

    const paths = Array.isArray(route.path) ? route.path : [route.path];
    const subApp = app.basePath(`/${namespace}`);

    const wrappedHandler: Handler = async (ctx) => {
        if (!ctx.get('data')) {
            const response = await route.handler(ctx);
            if (response instanceof Response) {
                return response;
            }
            ctx.set('data', response);
        }
    };

    for (const path of paths) {
        namespaces[namespace].routes[path] = {
            ...route,
            location: `custom/${namespace}`,
        };

        subApp.get(path, wrappedHandler);
    }
}
