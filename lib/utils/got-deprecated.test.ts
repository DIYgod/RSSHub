import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import got from './got-deprecated';

let server: http.Server;
let baseUrl = '';
let retryCount = 0;

beforeAll(async () => {
    server = http.createServer((req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);

        if (url.pathname === '/json') {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        if (url.pathname === '/redirect') {
            res.writeHead(302, { location: '/json' });
            res.end();
            return;
        }

        if (url.pathname === '/retry') {
            if (retryCount < 1) {
                retryCount += 1;
                res.writeHead(503, { 'content-type': 'text/plain' });
                res.end('retry');
                return;
            }
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ retried: true }));
            return;
        }

        if (url.pathname === '/echo') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                res.writeHead(200, { 'content-type': 'text/plain' });
                res.end(body);
            });
            return;
        }

        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
    });

    await new Promise<void>((resolve) => {
        server.listen(0, () => resolve());
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
    await new Promise<void>((resolve) => {
        server.close(() => resolve());
    });
});

describe('got-deprecated', () => {
    it('parses JSON responses and exposes data/status', async () => {
        const response = await got.get(`${baseUrl}/json`);
        expect(response.data).toEqual({ ok: true });
        expect(response.status).toBe(200);
    });

    it('keeps text bodies when response is not JSON', async () => {
        const response = await got.post(`${baseUrl}/echo`, {
            body: 'payload',
        });
        expect(response.data).toBe('payload');
        expect(response.status).toBe(200);
    });

    it('retries on errors and follows redirects', async () => {
        retryCount = 0;
        const redirected = await got.get(`${baseUrl}/redirect`);
        expect(redirected.data).toEqual({ ok: true });

        const retried = await got.get(`${baseUrl}/retry`, {
            retry: {
                limit: 1,
                calculateDelay: () => 1,
            },
        });
        expect(retried.data).toEqual({ retried: true });
    });

    it('resolves multiple requests with all()', async () => {
        const result = await got.all([Promise.resolve(1), Promise.resolve(2)]);
        expect(result).toEqual([1, 2]);
    });
});
