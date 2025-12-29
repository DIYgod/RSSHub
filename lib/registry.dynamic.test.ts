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
});
