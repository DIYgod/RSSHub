import type { Handler, Hono } from 'hono';
import { routePath } from 'hono/route';

import type { APIRoute, Namespace, Route } from '@/types';
import logger from '@/utils/logger';

const SEPARATOR = /[/\\]/;

export type RoutesType = Record<
    string,
    Route & {
        location: string;
    }
>;

export type NamespacesType = Record<
    string,
    Namespace & {
        routes: RoutesType;
        apiRoutes: Record<
            string,
            APIRoute & {
                location: string;
            }
        >;
    }
>;

export type ModulesType = Record<string, { route: Route } | { namespace: Namespace } | { apiRoute: APIRoute }>;

/**
 * A directory under lib/routes that contains a `namespace.ts` is a "namespace root". Roots are keyed by their path
 * relative to lib/routes, joined with `/` (e.g. `github/enterprise`).
 */
export function collectNamespaceRoots(moduleKeys: string[]): Set<string> {
    const roots = new Set<string>();
    for (const key of moduleKeys) {
        const segments = key.split(SEPARATOR).filter(Boolean);
        if (segments.at(-1) === 'namespace.ts') {
            roots.add(segments.slice(0, -1).join('/'));
        }
    }
    return roots;
}

/**
 * A module belongs to its longest matching namespace root; modules with no matching root fall back to their first
 * path segment (flat namespaces). `location` is the module path relative to the resolved namespace root.
 */
export function resolveModuleNamespace(moduleKey: string, roots: Set<string>): { namespace: string; location: string } {
    const segments = moduleKey.split(SEPARATOR).filter(Boolean);
    for (let i = segments.length - 1; i >= 1; i--) {
        const candidate = segments.slice(0, i).join('/');
        if (roots.has(candidate)) {
            return { namespace: candidate, location: segments.slice(i).join('/') };
        }
    }
    return { namespace: segments[0], location: segments.slice(1).join('/') };
}

/**
 * Merge directory-imported modules into `namespaces` (mutated in place). Module keys must be relative to
 * lib/routes (e.g. `/github/enterprise/news.ts`).
 */
export function applyModulesToNamespaces(modules: ModulesType, namespaces: NamespacesType): void {
    const namespaceRoots = collectNamespaceRoots(Object.keys(modules));
    for (const module in modules) {
        const content = modules[module];
        const { namespace, location } = resolveModuleNamespace(module, namespaceRoots);
        if ('namespace' in content) {
            namespaces[namespace] = Object.assign(
                {
                    routes: {},
                    apiRoutes: {},
                },
                namespaces[namespace],
                content.namespace
            );
        } else if ('route' in content) {
            if (!Object.hasOwn(namespaces, namespace)) {
                namespaces[namespace] = {
                    name: namespace,
                    routes: {},
                    apiRoutes: {},
                };
            }
            if (Array.isArray(content.route.path)) {
                for (const path of content.route.path) {
                    namespaces[namespace].routes[path] = {
                        ...content.route,
                        location,
                    };
                }
            } else {
                namespaces[namespace].routes[content.route.path] = {
                    ...content.route,
                    location,
                };
            }
        } else if ('apiRoute' in content) {
            if (!Object.hasOwn(namespaces, namespace)) {
                namespaces[namespace] = {
                    name: namespace,
                    routes: {},
                    apiRoutes: {},
                };
            }
            if (Array.isArray(content.apiRoute.path)) {
                for (const path of content.apiRoute.path) {
                    namespaces[namespace].apiRoutes[path] = {
                        ...content.apiRoute,
                        location,
                    };
                }
            } else {
                namespaces[namespace].apiRoutes[content.apiRoute.path] = {
                    ...content.apiRoute,
                    location,
                };
            }
        }
    }
}

export const sortRoutes = (
    routes: Record<
        string,
        Route & {
            location: string;
            module?: () => Promise<{ route: Route }>;
        }
    >
) =>
    Object.entries(routes).toSorted(([pathA], [pathB]) => {
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

            // Regex-constrained parameters have priority over plain parameters
            if (segmentA.startsWith(':') && segmentA.includes('{') !== segmentB.includes('{')) {
                return segmentA.includes('{') ? -1 : 1;
            }
        }

        return 0;
    });

// Deeper namespaces register first so a parent's param routes cannot shadow them
const sortNamespacesByDepth = (namespaces: NamespacesType) => Object.keys(namespaces).toSorted((a, b) => b.split('/').length - a.split('/').length);

export function registerRssRoutes(app: Hono, namespaces: NamespacesType): void {
    for (const namespace of sortNamespacesByDepth(namespaces)) {
        const subApp = app.basePath(`/${namespace}`);

        const namespaceData = namespaces[namespace];
        if (!namespaceData || !namespaceData.routes) {
            continue;
        }

        const sortedRoutes = sortRoutes(namespaceData.routes);

        for (const [path, routeData] of sortedRoutes) {
            const wrappedHandler: Handler = async (ctx) => {
                logger.debug(`Matched route: ${routePath(ctx)}`);
                if (!ctx.get('data')) {
                    if (typeof routeData.handler !== 'function') {
                        if (process.env.NODE_ENV === 'test') {
                            const { route } = await import(`./routes/${namespace}/${routeData.location}`);
                            routeData.handler = route.handler;
                        } else if (routeData.module) {
                            const { route } = await routeData.module();
                            routeData.handler = route.handler;
                        }
                    }
                    const response = await routeData.handler(ctx);
                    if (response instanceof Response) {
                        return response;
                    }
                    ctx.set('data', response);
                }
            };
            subApp.get(path, wrappedHandler);
        }
    }
}

export function registerApiRoutes(app: Hono, namespaces: NamespacesType): void {
    for (const namespace of sortNamespacesByDepth(namespaces)) {
        const subApp = app.basePath(`/api/${namespace}`);

        const namespaceData = namespaces[namespace];
        if (!namespaceData || !namespaceData.apiRoutes) {
            continue;
        }

        const sortedRoutes = Object.entries(namespaceData.apiRoutes) as Array<
            [
                string,
                APIRoute & {
                    location: string;
                    module?: () => Promise<{ apiRoute: APIRoute }>;
                },
            ]
        >;

        for (const [path, routeData] of sortedRoutes) {
            const wrappedHandler: Handler = async (ctx) => {
                if (ctx.get('apiData')) {
                    return;
                }
                if (typeof routeData.handler !== 'function') {
                    if (process.env.NODE_ENV === 'test') {
                        const { apiRoute } = await import(`./routes/${namespace}/${routeData.location}`);
                        routeData.handler = apiRoute.handler;
                    } else if (routeData.module) {
                        const { apiRoute } = await routeData.module();
                        routeData.handler = apiRoute.handler;
                    }
                }
                const data = await routeData.handler(ctx);
                ctx.set('apiData', data);
            };
            subApp.get(path, wrappedHandler);
        }
    }
}
