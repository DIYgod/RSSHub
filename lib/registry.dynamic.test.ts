import type fs from 'node:fs';
import path from 'node:path';

import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

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
