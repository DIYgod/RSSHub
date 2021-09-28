process.env.NODE_NAME = 'mock';

import supertest from 'supertest';
jest.mock('request-promise-native');
import server from '../../lib/index';
const request = supertest(server);
import config from '../../lib/config').value;
let etag;

afterAll(() => {
    server.close();
});

describe('header', () => {
    it(`header`, async () => {
        const response = await request.get('/test/1');
        expect(response.headers['access-control-allow-origin']).toBe('127.0.0.1:1200');
        expect(response.headers['access-control-allow-methods']).toBe('GET');
        expect(response.headers['content-type']).toBe('application/xml; charset=utf-8');
        expect(response.headers['cache-control']).toBe(`public, max-age=${config.cache.routeExpire}`);
        expect(response.headers['last-modified']).toBe(response.text.match(/<lastBuildDate>(.*)<\/lastBuildDate>/)[1]);
        expect(response.headers['rsshub-node']).toBe('mock');
        expect(response.headers.etag).not.toBe(undefined);
        etag = response.headers.etag;
    });

    it(`etag`, async () => {
        const response = await request.get('/test/1').set('If-None-Match', etag);
        expect(response.status).toBe(304);
        expect(response.text).toBe('');
        expect(response.headers['last-modified']).toBe(undefined);
    });
});
