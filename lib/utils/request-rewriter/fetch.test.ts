import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import zlib from 'node:zlib';

import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { getCurrentCell, setCurrentCell } from 'node-network-devtools';
import undici from 'undici';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { config } from '@/config';

import wrappedFetch, { useCustomHeader } from './fetch';

const getInitRequest = (): NonNullable<ReturnType<typeof getCurrentCell>>['request'] => ({
    requestHeaders: {},
    id: '',
    loadCallFrames: () => {},
    cookies: '',
    requestData: '',
    responseData: '',
    responseHeaders: {},
    responseInfo: {},
});

enum Env {
    dev = 'dev',
    production = 'production',
    test = 'test',
}

describe('useCustomHeader', () => {
    let originalEnv: string;

    beforeEach(() => {
        originalEnv = process.env.NODE_ENV || Env.test;
        process.env.ENABLE_REMOTE_DEBUGGING = 'true';
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    test('should register request with custom headers in dev environment', async () => {
        process.env.NODE_ENV = Env.dev;

        const headers = new Headers();
        const headerText = 'authorization';
        const headerValue = 'Bearer token';
        headers.set(headerText, headerValue);

        const req = getInitRequest();
        setCurrentCell({
            request: req,
            pipes: [],
            isAborted: false,
        });

        await useCustomHeader(headers);

        const cell = getCurrentCell();
        expect(cell).toBeDefined();

        let request = req;
        if (cell) {
            for (const { pipe } of cell.pipes) {
                request = pipe(request);
            }
        }

        expect(request.requestHeaders[headerText]).toEqual(headerValue);
    });

    test('should not register request in non-dev environment', async () => {
        process.env.NODE_ENV = Env.production;

        const headers = new Headers();
        const headerText = 'content-type';
        const headerValue = 'application/json';

        headers.set(headerText, headerValue);
        const req = getInitRequest();

        setCurrentCell({
            request: req,
            pipes: [],
            isAborted: false,
        });
        await useCustomHeader(headers);

        const cell = getCurrentCell();
        expect(cell).toBeDefined();

        let request = req;
        if (cell) {
            for (const { pipe } of cell.pipes) {
                request = pipe(request);
            }
        }

        expect(req.requestHeaders[headerText]).toBeUndefined();
    });
});

describe('wrappedFetch', () => {
    test('throws when fetch fails', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockRejectedValueOnce(new Error('boom'));

        await expect(wrappedFetch('http://example.com')).rejects.toThrow('boom');

        fetchSpy.mockRestore();
    });

    test('installs a global dispatcher that prefers h2 in ALPN', () => {
        const dispatcher = undici.getGlobalDispatcher();
        const optionsKey = Object.getOwnPropertySymbols(dispatcher).find((s) => s.description === 'options')!;
        expect(dispatcher[optionsKey].connect.preferH2).toBe(true);
    });

    test('does not let one incoming request hold back the outgoing requests of another', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockImplementation(() => Promise.resolve(new undici.Response('ok')));

        const app = new Hono();
        app.use(contextStorage());
        app.get('/many', async (ctx) => {
            await Promise.all(Array.from({ length: 30 }, () => wrappedFetch('http://example.com/many')));
            return ctx.text('many');
        });
        app.get('/one', async (ctx) => {
            await wrappedFetch('http://example.com/one');
            return ctx.text('one');
        });

        const many = app.request('/many');
        await app.request('/one');
        // /one was queued behind at most the places /many may hold at once, not behind all 30
        expect(fetchSpy.mock.calls.length).toBeLessThan(20);

        await many;
        expect(fetchSpy).toHaveBeenCalledTimes(31);

        fetchSpy.mockRestore();
    });
});

describe('wrappedFetch credentialHeaders', () => {
    const received: Array<[string, string | undefined, string | undefined]> = [];
    const listen = async () => {
        const server = http.createServer((req, res) => {
            received.push([`http://${req.headers.host}${req.url}`, req.headers['x-auth-token'] as string | undefined, req.headers['x-custom'] as string | undefined]);
            const location = new URL(req.url!, 'http://localhost').searchParams.get('to');
            res.writeHead(location ? 302 : 200, location ? { location } : {}).end('ok');
        });
        await once(server.listen(0, '127.0.0.1'), 'listening');
        return server;
    };
    let servers: http.Server[];
    let service: string;
    let other: string;
    const init = { headers: { 'X-Auth-Token': 'secret', 'X-Custom': 'kept' }, credentialHeaders: ['X-Auth-Token'] };

    beforeAll(async () => {
        servers = await Promise.all([listen(), listen()]);
        [service, other] = servers.map((server) => `http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    });

    afterEach(() => {
        received.length = 0;
    });

    afterAll(() => {
        for (const server of servers) {
            server.close();
        }
    });

    test('drops them when a redirect leaves the origin', async () => {
        const response = await wrappedFetch(`${service}/?to=${other}/landing`, init);

        expect(await response.text()).toBe('ok');
        expect(received).toEqual([
            [`${service}/?to=${other}/landing`, 'secret', 'kept'],
            [`${other}/landing`, undefined, 'kept'],
        ]);
    });

    test('does not restore them when a redirect returns to the origin', async () => {
        await wrappedFetch(`${service}/?to=${encodeURIComponent(`${other}/?to=${service}/back`)}`, init);

        expect(received.at(-1)).toEqual([`${service}/back`, undefined, 'kept']);
    });

    test('keeps them when a redirect stays on the origin', async () => {
        await wrappedFetch(`${service}/?to=/moved`, init);

        expect(received.at(-1)).toEqual([`${service}/moved`, 'secret', 'kept']);
    });

    test('keeps them across redirects when not named', async () => {
        await wrappedFetch(`${service}/?to=${other}/landing`, { headers: init.headers });

        expect(received.at(-1)).toEqual([`${other}/landing`, 'secret', 'kept']);
    });
});

describe('wrappedFetch maxResponseSize', () => {
    // a smaller limit than the default keeps the test fast
    const limit = 1024 * 1024;
    const defaultLimit = config.requestMaxResponseSize;
    beforeEach(() => {
        config.requestMaxResponseSize = limit;
    });
    afterEach(() => {
        config.requestMaxResponseSize = defaultLimit;
    });
    let server: http.Server;
    let origin: string;

    beforeAll(async () => {
        server = http.createServer((req, res) => {
            const url = new URL(req.url!, 'http://localhost');
            if (url.pathname === '/redirect') {
                res.writeHead(302, { location: `/${url.search}` }).end();
                return;
            }
            const body = Buffer.alloc(Number(url.searchParams.get('size')), 'x');
            res.writeHead(Number(url.searchParams.get('status') ?? 200), { 'content-encoding': 'br', 'set-cookie': ['a=1', 'b=2'] }).end(zlib.brotliCompressSync(body));
        });
        await once(server.listen(0, '127.0.0.1'), 'listening');
        origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(() => {
        server.close();
    });

    test('returns a body that decodes to the limit', async () => {
        const response = await wrappedFetch(`${origin}/redirect?size=${limit}`);

        expect(response).toBeInstanceOf(undici.Response);
        expect(response.url).toBe(`${origin}/?size=${limit}`);
        expect(response.redirected).toBe(true);
        expect(response.type).toBe('basic');
        expect(response.headers.getSetCookie()).toEqual(['a=1', 'b=2']);
        expect(await response.text()).toHaveLength(limit);
    });

    test.each([404, 999])('keeps the status %d', async (status) => {
        const response = await wrappedFetch(`${origin}/?size=2&status=${status}`);

        expect(response.status).toBe(status);
        expect(response.ok).toBe(false);
        expect(await response.text()).toBe('xx');
    });

    test('fails a body that decodes to more than the limit', async () => {
        const response = await wrappedFetch(`${origin}/?size=${limit + 1}`);

        await expect(response.text()).rejects.toThrow(`Response body is larger than ${limit} bytes`);
    });

    test('can be set for a request', async () => {
        // wrappedFetch is typed as undici.fetch, whose init has no maxResponseSize
        const raised = { method: 'GET', maxResponseSize: limit + 1 };
        const lowered = { method: 'GET', maxResponseSize: 10 };
        const larger = await wrappedFetch(`${origin}/?size=${limit + 1}`, raised);
        const smaller = await wrappedFetch(`${origin}/?size=11`, lowered);

        expect(await larger.text()).toHaveLength(limit + 1);
        await expect(smaller.text()).rejects.toThrow('Response body is larger than 10 bytes');
    });
});
