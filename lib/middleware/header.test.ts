import { describe, expect, it, afterAll } from '@jest/globals';
import supertest from 'supertest';

process.env.NODE_NAME = 'mock';
process.env.ALLOW_ORIGIN = 'rsshub.mock';

let etag;

afterAll(() => {
    delete process.env.NODE_NAME;
    delete process.env.ALLOW_ORIGIN;
});

describe('header', () => {
    it(`header`, async () => {
        const request = supertest((await import('@/index')).default);
        const { config } = await import('@/config');
        const response = await request.get('/test/1');
        expect(response.headers['access-control-allow-origin']).toBe('rsshub.mock');
        expect(response.headers['access-control-allow-methods']).toBe('GET');
        expect(response.headers['content-type']).toBe('application/xml; charset=utf-8');
        expect(response.headers['cache-control']).toBe(`public, max-age=${config.cache.routeExpire}`);
        expect(response.headers['last-modified']).toBe(response.text.match(/<lastBuildDate>(.*)<\/lastBuildDate>/)?.[1]);
        expect(response.headers['rsshub-node']).toBe('mock');
        expect(response.headers.etag).not.toBe(undefined);
        etag = response.headers.etag;
    });

    it(`etag`, async () => {
        const request = supertest((await import('@/index')).default);
        const response = await request.get('/test/1').set('If-None-Match', etag);
        expect(response.status).toBe(304);
        expect(response.text).toBe('');
        expect(response.headers['last-modified']).toBe(undefined);
    });
});
