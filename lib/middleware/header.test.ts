import { afterAll, afterEach, describe, expect, it } from 'vitest';

import wait from '@/utils/wait';

process.env.NODE_NAME = 'mock';
process.env.ALLOW_ORIGIN = 'rsshub.mock';

let etag;

afterEach(async () => {
    await wait(1000);
});

afterAll(() => {
    delete process.env.NODE_NAME;
    delete process.env.ALLOW_ORIGIN;
});

describe('header', () => {
    it(`header`, async () => {
        const app = (await import('@/app')).default;
        const { config } = await import('@/config');
        const response = await app.request('/test/1');
        expect(response.headers.get('access-control-allow-origin')).toBe('rsshub.mock');
        expect(response.headers.get('access-control-allow-methods')).toBe('GET');
        expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
        expect(response.headers.get('cache-control')).toBe(`public, max-age=${config.cache.routeExpire}`);
        expect(response.headers.get('last-modified')).toBe((await response.text()).match(/<lastBuildDate>(.*)<\/lastBuildDate>/)?.[1]);
        expect(response.headers.get('rsshub-node')).toBe('mock');
        expect(response.headers.get('etag')).not.toBe(undefined);
        etag = response.headers.get('etag');
        expect(response.headers.get('x-rsshub-route')).toBe('/test/:id/:params?');
    });

    it(`etag`, async () => {
        const app = (await import('@/app')).default;
        const response = await app.request('/test/1', {
            headers: {
                'If-None-Match': etag,
            },
        });
        expect(response.status).toBe(304);
        expect(await response.text()).toBe('');
        expect(response.headers.get('last-modified')).toBe(null);
    });
});
