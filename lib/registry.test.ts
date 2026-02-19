import { describe, expect, it, vi } from 'vitest';

import app from '@/app';
import { config } from '@/config';

describe('registry', () => {
    // root
    it(`/`, async () => {
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
