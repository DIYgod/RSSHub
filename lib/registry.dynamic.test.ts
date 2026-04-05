import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

describe('registry dynamic loading', () => {
    it('loads production namespaces from build', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        vi.resetModules();

        const { namespaces } = await import('@/registry');
        expect(Object.keys(namespaces).length).toBeGreaterThan(0);

        process.env.NODE_ENV = originalEnv;
    });

    it('builds namespaces from directory import and resolves module handlers', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const modules = {
            '/nsEmpty/namespace.ts': {
                namespace: {
                    name: 'Empty',
                    routes: null,
                },
            },
            '/nsRoute/route-array.ts': {
                route: {
                    path: ['/a', '/b'],
                    name: 'Array',
                },
            },
            '/nsRoute/route-single.ts': {
                route: {
                    path: '/single',
                    name: 'Single',
                    handler: () => ({
                        title: 'ok',
                        link: 'https://example.com',
                        item: [],
                        allowEmpty: true,
                    }),
                },
            },
            '/nsModule/route-module.ts': {
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
            '/nsApi/api-array.ts': {
                apiRoute: {
                    path: ['/a1', '/a2'],
                    name: 'ApiArray',
                    handler: () => ({ ok: true }),
                },
            },
            '/nsApi/api-single.ts': {
                apiRoute: {
                    path: '/single',
                    name: 'ApiSingle',
                    handler: () => ({ ok: true }),
                },
            },
            '/nsApi/api-module.ts': {
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
            '/test/api-index.ts': {
                apiRoute: {
                    path: '/',
                    name: 'ApiIndex',
                },
            },
        };

        const directoryImportMock = vi.fn(() => modules);
        vi.doMock('@/utils/directory-import', () => ({
            directoryImport: directoryImportMock,
        }));
        vi.resetModules();
        const { namespaces, default: registry } = await import('@/registry');

        expect(directoryImportMock).toHaveBeenCalled();
        expect(namespaces.nsRoute.routes['/single']).toBeDefined();
        expect(namespaces.nsApi.apiRoutes['/single']).toBeDefined();

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

        const routeResponse = await app.request('/nsModule/module');
        expect(await routeResponse.text()).toBe('module');
        await app.request('/api/nsApi/module');

        process.env.NODE_ENV = 'test';
        const apiTestResponse = await app.request('/api/test');
        expect(await apiTestResponse.json()).toEqual({ code: 0 });

        process.env.NODE_ENV = originalEnv;
    });

    // https://github.com/DIYgod/RSSHub/pull/18002
    it('prioritizes literal segments over parameter segments in route matching', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const modules = {
            '/specificity/param-route.ts': {
                route: {
                    path: '/:category',
                    name: 'ParamRoute',
                    handler: () => ({
                        title: 'param',
                        link: 'https://example.com',
                        item: [],
                        allowEmpty: true,
                    }),
                },
            },
            '/specificity/literal-route.ts': {
                route: {
                    path: '/news/:channel',
                    name: 'LiteralRoute',
                    handler: () => ({
                        title: 'literal',
                        link: 'https://example.com',
                        item: [],
                        allowEmpty: true,
                    }),
                },
            },
            '/specificity/news-route.ts': {
                route: {
                    path: '/news',
                    name: 'NewsRoute',
                    handler: () => ({
                        title: 'news',
                        link: 'https://example.com',
                        item: [],
                        allowEmpty: true,
                    }),
                },
            },
        };

        const directoryImportMock = vi.fn(() => modules);
        vi.doMock('@/utils/directory-import', () => ({
            directoryImport: directoryImportMock,
        }));
        vi.resetModules();
        const { default: registry } = await import('@/registry');

        const app = new Hono();
        app.use(async (ctx, next) => {
            await next();
            const data = ctx.get('data');
            if (data) {
                return ctx.json(data);
            }
        });
        app.route('/', registry);

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
    });
});
