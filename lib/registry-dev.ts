import fs from 'node:fs';
import path from 'node:path';

import type { Context, MiddlewareHandler } from 'hono';
import { Hono } from 'hono';

import type { ModulesType, NamespacesType } from '@/registry-helpers';
import { applyModulesToNamespaces, registerApiRoutes, registerRssRoutes } from '@/registry-helpers';
import { directoryImport } from '@/utils/directory-import';

export type DevRegistry = {
    middleware: MiddlewareHandler;
    ensureAllLoaded: () => Promise<void>;
};

/**
 * Dev-only lazy route loading. Hono routers reject new routes once an app has matched a request
 * ("matcher is already built"), so each top-level routes directory gets its own self-contained
 * sub-app, built on first request and dispatched from the middleware.
 */
export function createDevRegistry({ routesDirectory, namespaces }: { routesDirectory: string; namespaces: NamespacesType }): DevRegistry {
    const subApps = new Map<string, Promise<Hono>>();
    const outerContexts = new WeakMap<Request, Context>();

    // One readdir at startup replaces per-request fs probing (and doubles as the path-safety check);
    // a top-level directory added at runtime needs a restart, which tsx watch does on any save anyway.
    const topDirectories = new Set(
        fs
            .readdirSync(routesDirectory, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
    );

    // Sub-apps run on a fresh context; copy the outer vars in so handlers see middleware state
    // (e.g. parameters), and copy back out so ctx.set('data') reaches the upstream template middleware.
    const bridge: MiddlewareHandler = async (ctx, next) => {
        const outer = outerContexts.get(ctx.req.raw);
        if (outer) {
            for (const [key, value] of Object.entries(outer.var)) {
                ctx.set(key as never, value as never);
            }
        }
        await next();
        if (outer) {
            for (const [key, value] of Object.entries(ctx.var)) {
                outer.set(key as never, value as never);
            }
        }
        const vars = ctx.var as Record<string, unknown>;
        if (!ctx.finalized && (vars.data || vars.apiData)) {
            // Data-producing handlers return undefined (the outer template middleware renders the
            // bridged vars); finalize so Hono does not raise "Context is not finalized".
            ctx.res = new Response(null, { status: 204 });
        }
    };

    const loadTopDirectory = async (name: string): Promise<Hono> => {
        const modules = (await directoryImport({
            targetDirectoryPath: path.join(routesDirectory, name),
            importPattern: /\.tsx?$/,
        })) as ModulesType;

        // directoryImport keys are relative to the imported directory; restore the lib/routes-relative form
        const prefixed: ModulesType = {};
        for (const key in modules) {
            prefixed[`/${name}${key}`] = modules[key];
        }
        applyModulesToNamespaces(prefixed, namespaces);

        const subApp = new Hono();
        // Rethrow so subApp.fetch rejects and handler errors reach the outer app's error handler
        // instead of Hono's bare text-500 default.
        subApp.onError((error) => {
            throw error;
        });
        subApp.use('*', bridge);
        const subset = Object.fromEntries(Object.entries(namespaces).filter(([key]) => key === name || key.startsWith(`${name}/`)));
        registerRssRoutes(subApp, subset);
        registerApiRoutes(subApp, subset);
        return subApp;
    };

    const ensureTopDirectory = async (name: string): Promise<Hono> => {
        let promise = subApps.get(name);
        if (!promise) {
            promise = loadTopDirectory(name);
            subApps.set(name, promise);
        }
        try {
            return await promise;
        } catch (error) {
            // Import errors are not memoized so a fixed file works on the next request
            subApps.delete(name);
            throw error;
        }
    };

    const middleware: MiddlewareHandler = async (ctx, next) => {
        const segments = ctx.req.path.split('/').filter(Boolean);
        const candidate = segments[0] === 'api' ? segments[1] : segments[0];
        if (!candidate || !topDirectories.has(candidate)) {
            return next();
        }
        const subApp = await ensureTopDirectory(candidate);
        outerContexts.set(ctx.req.raw, ctx);
        try {
            const response = await subApp.fetch(ctx.req.raw);
            if (ctx.get('data') || ctx.get('apiData')) {
                // The upstream template middleware renders from the bridged vars
                return;
            }
            if (response.status === 404) {
                return next();
            }
            return response;
        } finally {
            outerContexts.delete(ctx.req.raw);
        }
    };

    const ensureAllLoaded = async (): Promise<void> => {
        await Promise.all([...topDirectories].map((name) => ensureTopDirectory(name)));
    };

    return { middleware, ensureAllLoaded };
}
