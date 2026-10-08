import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { NamespacesType } from '@/registry-helpers';
import type { Namespace, Route } from '@/types';

export async function loadUserRoutes(directory: string, reserved: Iterable<string>): Promise<NamespacesType> {
    const taken = new Set([...reserved].map((namespace) => namespace.split('/', 1)[0]));
    const namespaces: NamespacesType = {};
    const entries = await readdir(directory, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.mjs'));
    for (const entry of files) {
        const key = entry.name.slice(0, -4);
        if (!/^[a-z][a-z\d-]*$/.test(key) || taken.has(key) || ['api', 'healthz', 'metrics', 'robots.txt'].includes(key)) {
            throw new Error(`Private route namespace ${key} is invalid or conflicts with a built-in namespace.`);
        }
    }
    const modules = await Promise.all(files.map((entry) => import(pathToFileURL(path.resolve(directory, entry.name)).href)));
    for (const [index, entry] of files.entries()) {
        const key = entry.name.slice(0, -4);
        const module: { namespace: Namespace; routes: Route[] } = modules[index];
        if (!module.namespace?.name || !module.namespace.url || !Array.isArray(module.routes) || !module.routes.length) {
            throw new Error(`${entry.name} must export namespace (with name and url) and a nonempty routes array.`);
        }
        const routes: NamespacesType[string]['routes'] = {};
        for (const route of module.routes) {
            if (typeof route.handler !== 'function') {
                throw new TypeError(`Private route in ${entry.name} must provide a handler function.`);
            }
            const paths = Array.isArray(route.path) ? route.path : [route.path];
            for (const routePath of paths) {
                if (typeof routePath !== 'string' || !routePath.startsWith('/') || Object.hasOwn(routes, routePath)) {
                    throw new Error(`Invalid or duplicate private route path in ${entry.name}: ${routePath}`);
                }
                routes[routePath] = { ...route, path: routePath, location: entry.name };
            }
        }
        namespaces[key] = { ...module.namespace, routes, apiRoutes: {} };
    }
    return namespaces;
}
