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
                module?: () => Promise<{ apiRoute: APIRoute }>;
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
export function resolveModuleNamespace(moduleKey: string, roots: Set<string>) {
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

// Literal segments (anything not starting with `:`) rank before regex-constrained params, which rank before plain params
const segmentRank = (segment: string) => {
    if (!segment.startsWith(':')) {
        return 0;
    }
    return segment.includes('{') ? 1 : 2;
};

/**
 * The first registered route wins, so more specific paths are registered first. Paths are compared by segment
 * rank, position by position, and the first difference decides; literal values are ignored, so `/articles` and
 * `/radios` tie and keep their original order. If one path runs out of segments first, it goes first (an exact
 * route beats an omitted optional segment) unless it ends with a regex param, which may span several segments
 * (e.g. `/:link{.+}`) and would shadow the longer path. This is a lexicographic order on segment ranks plus an
 * end marker (lowest, or highest after a regex param), so it is transitive as `toSorted` requires.
 */
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
        const minLen = Math.min(segmentsA.length, segmentsB.length);

        for (let i = 0; i < minLen; i++) {
            const rankDiff = segmentRank(segmentsA[i]) - segmentRank(segmentsB[i]);
            if (rankDiff !== 0) {
                return rankDiff;
            }
        }

        // Both paths have the same rank at minLen - 1, the last segment of the shorter one
        const endsWithRegexParam = segmentRank(segmentsA[minLen - 1]) === 1;
        return endsWithRegexParam ? segmentsB.length - segmentsA.length : segmentsA.length - segmentsB.length;
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
                if (ctx.get('data')) {
                    return;
                }

                if (!routeData.handler) {
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

        const sortedRoutes = Object.entries(namespaceData.apiRoutes);

        for (const [path, routeData] of sortedRoutes) {
            const wrappedHandler: Handler = async (ctx) => {
                if (ctx.get('apiData')) {
                    return;
                }
                if (!routeData.handler) {
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
