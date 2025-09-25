import { describe, expect, it, afterAll } from 'vitest';
import supertest from 'supertest';
import server from '@/index';

const request = supertest(server);

afterAll(() => {
    server.close();
});

describe('generic_proxy route', () => {
    it('proxies a small binary file', async () => {
        const target = encodeURIComponent('https://httpbingo.org/bytes/10');
        const res = await request.get(`/generic_proxy/${target}`);
        expect(res.status).toBe(200);
        expect(res.body instanceof Buffer || typeof res.body === 'string').toBeTruthy();
        const len = Buffer.isBuffer(res.body) ? res.body.length : Buffer.from(res.body).length;
        expect(len).toBe(10);
    }, 20000);

    it('forwards upstream 404 status', async () => {
        const target = encodeURIComponent('https://httpbingo.org/status/404');
        const res = await request.get(`/generic_proxy/${target}`);
        expect(res.status).toBe(404);
    }, 20000);

    it('rejects non-GET with 405', async () => {
        const target = encodeURIComponent('https://httpbingo.org/get');
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


