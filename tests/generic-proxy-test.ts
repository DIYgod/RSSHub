import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import supertest from 'supertest';
import server from '@/index';
import { http, HttpResponse } from 'msw';

const request = supertest(server);
const isFullRoutes = (globalThis as any)?.process?.env?.FULL_ROUTES_TEST === 'true';

// Use MSW to avoid external network dependency in CI
beforeAll(async () => {
    const { default: mswServer } = await import('@/setup.test');
    mswServer.use(
        http.get('https://remote.test/bytes/10', () => {
            return HttpResponse.arrayBuffer(new ArrayBuffer(10));
        }),
        http.get('https://remote.test/status/404', () => {
            return new HttpResponse(null, { status: 404 });
        }),
        http.get('https://remote.test/get', () => {
            return HttpResponse.text('ok');
        })
    );
});

afterAll(() => {
    server.close();
});

// In normal unit test runs, routes may not be mounted; run these only in FULL_ROUTES_TEST
const describeMaybe = isFullRoutes ? describe : describe.skip;

describeMaybe('generic_proxy route', () => {
    it('proxies a small binary file', async () => {
        const target = encodeURIComponent('https://remote.test/bytes/10');
        const res = await request.get(`/generic_proxy/${target}`);
        expect(res.status).toBe(200);
        expect(res.body instanceof Buffer || typeof res.body === 'string').toBeTruthy();
        const len = Buffer.isBuffer(res.body) ? res.body.length : Buffer.from(res.body).length;
        expect(len).toBe(10);
    }, 20000);

    it('forwards upstream 404 status', async () => {
        const target = encodeURIComponent('https://remote.test/status/404');
        const res = await request.get(`/generic_proxy/${target}`);
        expect(res.status).toBe(404);
    }, 20000);

    it('rejects non-GET with 405', async () => {
        const target = encodeURIComponent('https://remote.test/get');
        const res = await request.post(`/generic_proxy/${target}`);
        expect(res.status).toBe(405);
        expect(res.text).toContain('Method Not Allowed');
    });

    it('rejects invalid scheme', async () => {
        const target = encodeURIComponent('ftp://example.com/file.txt');
        const res = await request.get(`/generic_proxy/${target}`);
        expect(res.status).toBe(400);
    });
});


