import { describe, expect, it, vi } from 'vitest';

import app from '@/app';
import { config } from '@/config';
import registryApp, { collectNamespaceRoots, namespaces, resolveModuleNamespace, sortRoutes } from '@/registry';
import type { Route } from '@/types';

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
