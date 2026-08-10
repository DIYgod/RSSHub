import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Hono } from 'hono';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDevRegistry } from '@/registry-dev';
import type { NamespacesType } from '@/registry-helpers';

const directoryImportMock = vi.hoisted(() => vi.fn());

vi.mock('@/utils/directory-import', () => ({
    directoryImport: directoryImportMock,
}));

// Fake route modules keyed by top-level directory; inner keys are relative to that directory,
// matching what directoryImport returns for a scoped import.
const fakeDirectories: Record<string, Record<string, unknown>> = {
    flat: {
        '/single.ts': {
            route: {
                path: '/single',
                name: 'Single',
                handler: () => ({ title: 'flat-single', link: 'https://example.com', item: [], allowEmpty: true }),
            },
        },
        '/param.ts': {
            route: {
                path: '/:id',
                name: 'Param',
                handler: (ctx) => ({ title: `param-${ctx.req.param('id')}`, link: 'https://example.com', item: [], allowEmpty: true }),
            },
        },
        '/outer.ts': {
            route: {
                path: '/outer',
                name: 'Outer',
                handler: (ctx) => ({ title: String(ctx.get('fromOuter')), link: 'https://example.com', item: [], allowEmpty: true }),
            },
        },
        '/boom.ts': {
            route: {
                path: '/boom',
                name: 'Boom',
                handler: () => {
                    throw new Error('handler-boom');
                },
            },
        },
    },
    github: {
        '/namespace.ts': { namespace: { name: 'GitHub' } },
        '/enterprise/namespace.ts': { namespace: { name: 'GitHub Enterprise' } },
        '/enterprise/news.ts': {
            route: {
                path: '/news',
                name: 'News',
                handler: () => ({ title: 'github-enterprise-news', link: 'https://example.com', item: [], allowEmpty: true }),
            },
        },
    },
    withapi: {
        '/api.ts': {
            apiRoute: {
                path: '/ping',
                name: 'Ping',
                handler: () => ({ ok: true }),
            },
        },
    },
};

const mockImplementation = ({ targetDirectoryPath }: { targetDirectoryPath: string }) => {
    const name = targetDirectoryPath.split(/[/\\]/).findLast(Boolean) as string;
    return Promise.resolve(fakeDirectories[name]);
};

// The registry lists real directories at startup; module contents come from the mocked importer
const routesDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsshub-dev-registry-'));
for (const name of Object.keys(fakeDirectories)) {
    fs.mkdirSync(path.join(routesDirectory, name));
}
afterAll(() => {
    fs.rmSync(routesDirectory, { recursive: true, force: true });
});

const buildApp = () => {
    const namespaces: NamespacesType = {};
    const dev = createDevRegistry({ routesDirectory, namespaces });
    const app = new Hono();
    app.use(async (ctx, next) => {
        ctx.set('fromOuter', 'bridged');
        await next();
        const apiData = ctx.get('apiData');
        if (apiData) {
            return ctx.json(apiData);
        }
        const data = ctx.get('data');
        if (data) {
            return ctx.json(data);
        }
    });
    app.use('*', dev.middleware);
    app.get('/static', (ctx) => ctx.text('static-ok'));
    return { app, dev, namespaces };
};

describe('createDevRegistry', () => {
    beforeEach(() => {
        directoryImportMock.mockReset().mockImplementation(mockImplementation);
    });

    it('imports nothing at startup', () => {
        buildApp();
        expect(directoryImportMock).not.toHaveBeenCalled();
    });

    it('loads a namespace on first request and serves its routes', async () => {
        const { app } = buildApp();
        const response = await app.request('/flat/single');
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.title).toBe('flat-single');
        expect(directoryImportMock).toHaveBeenCalledTimes(1);
    });

    it('imports each top directory at most once', async () => {
        const { app } = buildApp();
        await app.request('/flat/single');
        const second = await app.request('/flat/abc');
        const body = await second.json();
        expect(body.title).toBe('param-abc');
        expect(directoryImportMock).toHaveBeenCalledTimes(1);
    });

    it('bridges outer context vars into route handlers', async () => {
        const { app } = buildApp();
        const response = await app.request('/flat/outer');
        const body = await response.json();
        expect(body.title).toBe('bridged');
    });

    it('serves nested namespaces', async () => {
        const { app } = buildApp();
        const response = await app.request('/github/enterprise/news');
        const body = await response.json();
        expect(body.title).toBe('github-enterprise-news');
    });

    it('serves api routes under /api', async () => {
        const { app } = buildApp();
        const response = await app.request('/api/withapi/ping');
        const body = await response.json();
        expect(body).toEqual({ ok: true });
    });

    it('falls through for unknown directories without touching the importer', async () => {
        const { app } = buildApp();
        const first = await app.request('/static');
        const body = await first.text();
        expect(body).toBe('static-ok');
        await app.request('/static');
        expect(directoryImportMock).not.toHaveBeenCalled();
    });

    it('returns 404 for unmatched paths inside a loaded namespace', async () => {
        const { app } = buildApp();
        const response = await app.request('/withapi/nope');
        expect(response.status).toBe(404);
    });

    it('populates the shared namespaces object', async () => {
        const { app, namespaces } = buildApp();
        await app.request('/github/enterprise/news');
        expect(namespaces['github/enterprise'].routes['/news']).toBeDefined();
    });

    it('propagates route handler errors to the outer error handler', async () => {
        const { app } = buildApp();
        let seen: unknown = null;
        app.onError((error, ctx) => {
            seen = error;
            return ctx.text('outer-handled', 503);
        });
        const response = await app.request('/flat/boom');
        expect((seen as Error)?.message).toBe('handler-boom');
        expect(response.status).toBe(503);
        const body = await response.text();
        expect(body).toBe('outer-handled');
    });

    it('retries a directory whose import failed', async () => {
        const { app } = buildApp();
        directoryImportMock.mockRejectedValueOnce(new Error('boom'));
        const first = await app.request('/flat/single');
        expect(first.status).toBe(500);
        const second = await app.request('/flat/single');
        expect(second.status).toBe(200);
    });

    it('ensureAllLoaded imports every top-level directory', async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsshub-dev-registry-'));
        try {
            fs.mkdirSync(path.join(tmp, 'flat'));
            fs.mkdirSync(path.join(tmp, 'github'));
            fs.writeFileSync(path.join(tmp, 'not-a-dir.ts'), '');
            const namespaces: NamespacesType = {};
            const dev = createDevRegistry({ routesDirectory: tmp, namespaces });
            await dev.ensureAllLoaded();
            expect(directoryImportMock).toHaveBeenCalledTimes(2);
            expect(Object.keys(namespaces).toSorted((a, b) => a.localeCompare(b))).toEqual(['flat', 'github', 'github/enterprise']);
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
    });
});
