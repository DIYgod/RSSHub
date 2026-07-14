import type fs from 'node:fs';
import path from 'node:path';

import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

import app from '@/app';
import { config } from '@/config';
import registryApp, { collectNamespaceRoots, namespaces, resolveModuleNamespace, sortRoutes } from '@/registry';
import type { Route } from '@/types';

// The dev registry lists lib/routes at startup; expose the fixture directory names there
const fakeTopDirectories = vi.hoisted(() => ({ names: [] as string[] }));

vi.mock('node:fs', async (importOriginal) => {
    const actual = await importOriginal<typeof fs>();
    const readdirSync = ((target: unknown, options: unknown) => {
        if (fakeTopDirectories.names.length > 0 && String(target).endsWith(path.join('lib', 'routes'))) {
            return fakeTopDirectories.names.map((name) => ({ name, isDirectory: () => true }));
        }
        return actual.readdirSync(target as never, options as never);
    }) as typeof actual.readdirSync;
    return { ...actual, readdirSync, default: { ...actual, readdirSync } };
});

describe('registry', () => {
    // root
    it('/', async () => {
        const response = await app.request('/');
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('text/html; charset=UTF-8');
        expect(response.headers.get('cache-control')).toBe('no-cache');
    });

    // robots.txt
    it('/robots.txt', async () => {
        config.disallowRobot = false;
        const response404 = await app.request('/robots.txt');
        expect(response404.status).toBe(404);

        config.disallowRobot = true;
        const response = await app.request('/robots.txt');
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('User-agent: *\nDisallow: /');
        expect(response.headers.get('content-type')).toBe('text/plain; charset=UTF-8');
    });

    // favicon.ico
    it('/favicon.ico', async () => {
        const response = await app.request('/favicon.ico');
        expect(response.status).toBe(200);
    });

    // healthz
    it('/healthz', async () => {
        const response = await app.request('/healthz');
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBe('no-cache');
        expect(await response.text()).toBe('ok');
    });

    it('namespaces respects DISABLE_NSFW=true', async () => {
        vi.resetModules();
        vi.stubEnv('DISABLE_NSFW', 'true');

        const { namespaces } = await import('./registry');
        const routesModule = await import('../assets/build/routes.json');
        const rawNamespaces = (routesModule.default ?? routesModule) as Record<string, { routes?: Record<string, { features?: { nsfw?: boolean } }> }>;
        const nsfwNamespaces = Object.entries(rawNamespaces).filter(([, namespace]) => Object.values(namespace.routes ?? {}).some((route) => route.features?.nsfw));

        // All routes in all namespaces should not have nsfw features
        for (const ns of Object.values(namespaces)) {
            for (const route of Object.values(ns.routes)) {
                expect(route.features?.nsfw).not.toBe(true);
            }
        }
        expect(nsfwNamespaces.length).toBeGreaterThan(0);
        for (const [key] of nsfwNamespaces) {
            expect(namespaces[key]).toBeUndefined();
        }
    });

    it('namespaces includes NSFW routes when DISABLE_NSFW=false', async () => {
        vi.resetModules();
        vi.stubEnv('DISABLE_NSFW', 'false');

        const { namespaces } = await import('./registry');
        expect(namespaces['2048']).toBeDefined();
    });
});

describe('namespace-resolution', () => {
    const keys = [
        '/github/namespace.ts',
        '/github/issue.ts',
        '/example/sub/namespace.ts',
        '/example/sub/news.ts',
        '/example/flat/typical.ts',
        '/example/nested/namespace.ts',
        '/example/nested/zzb.ts',
        '/example/nested/deep/namespace.ts',
        '/example/nested/deep/zwfw.ts',
    ];
    const roots = collectNamespaceRoots(keys);

    it('collects directories containing namespace.ts', () => {
        expect(roots).toEqual(new Set(['github', 'example/sub', 'example/nested', 'example/nested/deep']));
    });

    it('resolves a flat module to its top directory', () => {
        expect(resolveModuleNamespace('/github/issue.ts', roots)).toEqual({ namespace: 'github', location: 'issue.ts' });
    });

    it('resolves a nested module to its namespace root', () => {
        expect(resolveModuleNamespace('/example/sub/news.ts', roots)).toEqual({ namespace: 'example/sub', location: 'news.ts' });
    });

    it('prefers the deepest matching root', () => {
        expect(resolveModuleNamespace('/example/nested/deep/zwfw.ts', roots)).toEqual({ namespace: 'example/nested/deep', location: 'zwfw.ts' });
        expect(resolveModuleNamespace('/example/nested/zzb.ts', roots)).toEqual({ namespace: 'example/nested', location: 'zzb.ts' });
    });

    it('falls back to the first segment when no root matches', () => {
        expect(resolveModuleNamespace('/example/flat/typical.ts', roots)).toEqual({ namespace: 'example', location: 'flat/typical.ts' });
    });

    it('resolves namespace.ts itself to its own root', () => {
        expect(resolveModuleNamespace('/example/sub/namespace.ts', roots)).toEqual({ namespace: 'example/sub', location: 'namespace.ts' });
    });
});

describe('nested namespace mounting', () => {
    it('registers deeper namespaces before shallower ones', () => {
        const keys = Object.keys(namespaces).filter((key) => Object.keys(namespaces[key].routes ?? {}).length > 0);
        const byDepth = keys.toSorted((a, b) => b.split('/').length - a.split('/').length);
        const deep = byDepth[0];
        const shallow = byDepth.at(-1) as string;
        expect(deep.split('/').length).toBeGreaterThan(shallow.split('/').length);

        const paths = registryApp.routes.map((r) => r.path);
        const deepIndex = paths.indexOf(`/${deep}${Object.keys(namespaces[deep].routes)[0]}`);
        const shallowIndex = paths.indexOf(`/${shallow}${Object.keys(namespaces[shallow].routes)[0]}`);
        expect(deepIndex).toBeGreaterThanOrEqual(0);
        expect(shallowIndex).toBeGreaterThanOrEqual(0);
        expect(deepIndex).toBeLessThan(shallowIndex);
    });

    it('sorts regex-constrained params before plain params', () => {
        const stub = {} as Route & { location: string };
        const sorted = sortRoutes({
            '/:category?': stub,
            '/:id{[0-9]+}': stub,
            '/static': stub,
        });
        expect(sorted.map(([path]) => path)).toEqual(['/static', '/:id{[0-9]+}', '/:category?']);
    });
});

const perDirectoryMock = (fakeDirectories: Record<string, Record<string, unknown>>) => {
    fakeTopDirectories.names = Object.keys(fakeDirectories);
    return vi.fn(({ targetDirectoryPath }: { targetDirectoryPath: string }) => {
        const name = targetDirectoryPath.split(/[/\\]/).findLast(Boolean) as string;
        return Promise.resolve(fakeDirectories[name]);
    });
};

const wrap = (registry: Hono) => {
    const app = new Hono();
    app.use(async (ctx, next) => {
        const response = await next();
        const apiData = ctx.get('apiData');
        if (apiData) {
            return ctx.json(apiData);
        }
        const data = ctx.get('data');
        if (data) {
            return ctx.json(data);
        }
        return response;
    });
    app.route('/', registry);
    return app;
};

describe('registry dynamic loading', () => {
    afterEach(() => {
        fakeTopDirectories.names = [];
    });

    it('loads production namespaces from build', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        vi.resetModules();

        const { namespaces } = await import('@/registry');
        expect(Object.keys(namespaces).length).toBeGreaterThan(0);

        process.env.NODE_ENV = originalEnv;
    });

    it('lazily builds namespaces from directory import on first request', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const directoryImportMock = perDirectoryMock({
            nsRoute: {
                '/route-array.ts': {
                    route: {
                        path: ['/a', '/b'],
                        name: 'Array',
                        handler: () => ({ title: 'array', link: 'https://example.com', item: [], allowEmpty: true }),
                    },
                },
                '/route-single.ts': {
                    route: {
                        path: '/single',
                        name: 'Single',
                        handler: () => ({ title: 'ok', link: 'https://example.com', item: [], allowEmpty: true }),
                    },
                },
            },
            nsModule: {
                '/route-module.ts': {
                    route: {
                        path: '/module',
                        name: 'Module',
                        module: () =>
                            Promise.resolve({
                                route: {
                                    handler: () => new Response('module'),
                                },
                            }),
                    },
                },
            },
            nsApi: {
                '/api-single.ts': {
                    apiRoute: {
                        path: '/single',
                        name: 'ApiSingle',
                        handler: () => ({ ok: true }),
                    },
                },
                '/api-module.ts': {
                    apiRoute: {
                        path: '/module',
                        name: 'ApiModule',
                        module: () =>
                            Promise.resolve({
                                apiRoute: {
                                    handler: () => ({ ok: true }),
                                },
                            }),
                    },
                },
            },
            test: {
                '/api-index.ts': {
                    apiRoute: {
                        path: '/',
                        name: 'ApiIndex',
                    },
                },
            },
        });
        vi.doMock('@/utils/directory-import', () => ({
            directoryImport: directoryImportMock,
        }));
        vi.resetModules();
        const { namespaces, default: registry } = await import('@/registry');

        // The cold-start guarantee: importing the registry imports no route modules
        expect(directoryImportMock).not.toHaveBeenCalled();

        const app = wrap(registry);

        const routeResponse = await app.request('/nsModule/module');
        expect(await routeResponse.text()).toBe('module');
        expect(directoryImportMock).toHaveBeenCalledTimes(1);

        const singleResponse = await app.request('/nsRoute/single');
        const singleBody = await singleResponse.json();
        expect(singleBody.title).toBe('ok');
        expect(namespaces.nsRoute.routes['/single']).toBeDefined();
        expect(namespaces.nsRoute.routes['/a']).toBeDefined();

        const apiResponse = await app.request('/api/nsApi/module');
        const apiBody = await apiResponse.json();
        expect(apiBody).toEqual({ ok: true });
        expect(namespaces.nsApi.apiRoutes['/single']).toBeDefined();

        // Handler resolution from disk in test env (real file lib/routes/test/api-index.ts)
        process.env.NODE_ENV = 'test';
        const apiTestResponse = await app.request('/api/test');
        expect(await apiTestResponse.json()).toEqual({ code: 0 });

        process.env.NODE_ENV = originalEnv;
        vi.doUnmock('@/utils/directory-import');
    });

    // https://github.com/DIYgod/RSSHub/pull/18002
    it('prioritizes literal segments over parameter segments in route matching', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const directoryImportMock = perDirectoryMock({
            specificity: {
                '/param-route.ts': {
                    route: {
                        path: '/:category',
                        name: 'ParamRoute',
                        handler: () => ({ title: 'param', link: 'https://example.com', item: [], allowEmpty: true }),
                    },
                },
                '/literal-route.ts': {
                    route: {
                        path: '/news/:channel',
                        name: 'LiteralRoute',
                        handler: () => ({ title: 'literal', link: 'https://example.com', item: [], allowEmpty: true }),
                    },
                },
                '/news-route.ts': {
                    route: {
                        path: '/news',
                        name: 'NewsRoute',
                        handler: () => ({ title: 'news', link: 'https://example.com', item: [], allowEmpty: true }),
                    },
                },
            },
        });
        vi.doMock('@/utils/directory-import', () => ({
            directoryImport: directoryImportMock,
        }));
        vi.resetModules();
        const { default: registry } = await import('@/registry');

        const app = wrap(registry);

        // /news/sports should match /news/:channel (literal "news" wins over :category)
        const literalResponse = await app.request('/specificity/news/sports');
        expect((await literalResponse.json()).title).toBe('literal');

        // /news should match /news (literal wins over :category)
        const newsResponse = await app.request('/specificity/news');
        expect((await newsResponse.json()).title).toBe('news');

        // /products should match /:category
        const paramResponse = await app.request('/specificity/products');
        expect((await paramResponse.json()).title).toBe('param');

        process.env.NODE_ENV = originalEnv;
        vi.doUnmock('@/utils/directory-import');
    });
});
